import { Promise } from "meteor/promise";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Jobs } from "/imports/api/jobs/jobs";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { Facebook, FacebookApiException } from "fb";
import _ from "underscore";
import moment from "moment";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret,
  admin: Meteor.settings.facebook.admin,
  adAccount: Meteor.settings.facebook.adAccount
};

const _fb = new Facebook(options);

const route = `act_${options.adAccount}/reachestimate`;

const FacebookAudiencesHelpers = {
  async updateAccountAudience({ campaignId, facebookAccountId }) {
    check(facebookAccountId, String);

    logger.debug("AudienceCategoriesHelpers.updateAccountAudience", {
      campaignId,
      facebookAccountId
    });

    const campaign = Campaigns.findOne(campaignId);
    const context = Contexts.findOne(campaign.contextId);
    const audienceCategories = AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    }).fetch();

    let jobIds = [];
    for (const audienceCategory of audienceCategories) {
      jobIds = jobIds.concat(
        FacebookAudiencesHelpers.fetchAudienceByCategory({
          contextId: context._id,
          audienceCategoryId: audienceCategory._id,
          facebookAccountId
        })
      );
    }

    logger.debug("AudienceCategoriesHelpers.updateAccountAudience jobIds", {
      jobIds
    });

    return await new Promise(resolve => {
      let completionMap = {};
      Jobs.find({
        _id: { $in: jobIds }
      }).observe({
        removed: function(job) {
          completionMap[job._id] = true;
          if(Object.keys(completionMap).length == jobIds.length) {
            resolve();
          }
        }
      });
    });

  },
  fetchAudienceByCategory({
    contextId,
    facebookAccountId,
    audienceCategoryId
  }) {
    check(contextId, String);
    check(facebookAccountId, String);
    check(audienceCategoryId, String);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceByCategory", {
      facebookAccountId,
      audienceCategoryId
    });

    const audienceCategory = AudienceCategories.findOne(audienceCategoryId);

    const spec = audienceCategory.spec;

    const jobIds = FacebookAudiencesHelpers.fetchContextAudiences({
      contextId,
      facebookAccountId,
      audienceCategoryId,
      spec
    });

    return jobIds;
  },
  _getRegionFacebookType({ type }) {
    switch (type) {
      case "region": {
        return "regions";
      }
      case "country": {
        return "countries";
      }
      case "cities":
      case "city": {
        return "cities";
      }
    }
  },
  fetchContextAudiences({
    facebookAccountId,
    contextId,
    audienceCategoryId,
    spec
  }) {
    check(facebookAccountId, String);
    check(audienceCategoryId, String);
    check(contextId, String);
    check(spec, Object);

    logger.debug("FacebookAudiencesHelpers.fetchContextAudiences", {
      facebookAccountId,
      contextId,
      spec
    });

    const context = Contexts.findOne(contextId);
    if (!context) {
      return { error: "Context does not exists" };
    }

    let jobIds = [];
    for (const geolocationId of context.geolocations) {
      const geolocation = Geolocations.findOne(geolocationId);
      spec["geo_locations"] = {};
      spec.geo_locations[
        FacebookAudiencesHelpers._getRegionFacebookType({
          type: geolocation.facebook.type
        })
      ] = [{ key: geolocation.facebook.key }];

      const jobId = JobsHelpers.addJob({
        jobType: "audiences.fetchAndCreateSpecAudience",
        jobData: {
          facebookAccountId,
          geolocationId,
          audienceCategoryId,
          spec
        }
      });

      jobIds.push(jobId);
    }
    return jobIds;
  },
  async fetchAndCreateSpecAudience({
    facebookAccountId,
    geolocationId,
    audienceCategoryId,
    spec
  }) {
    check(facebookAccountId, String);
    check(geolocationId, String);
    check(audienceCategoryId, String);
    check(spec, Object);

    const admin = Meteor.users.findOne({
      "services.facebook.id": options.admin
    });

    if (!admin) {
      return { error: "Admin does not exist." };
    }

    const accessToken = admin.services.facebook.accessToken;

    spec["connections"] = [facebookAccountId];

    const sleep = ms =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      });

    const fetch = async function(spec) {
      try {
        let res = await _fb.api(route, {
          targeting_spec: spec,
          access_token: accessToken
        });
        return res.data.users;
      } catch (error) {
        throw new Meteor.Error(error);
      }
    };

    let result = {};

    result["estimate"] = await fetch(spec);
    await sleep(2000);
    result["total"] = await fetch(_.omit(spec, "interests"));
    await sleep(2000);
    result["location_estimate"] = await fetch(_.omit(spec, "connections"));
    await sleep(2000);
    result["location_total"] = await fetch(
      _.omit(spec, "interests", "connections")
    );

    return FacebookAudiences.upsert(
      {
        facebookAccountId: facebookAccountId,
        audienceCategoryId: audienceCategoryId,
        fetch_date: moment().format("YYYY-MM-DD"),
        geoLocationId: geolocationId
      },
      { $set: result }
    );
  }
};

exports.FacebookAudiencesHelpers = FacebookAudiencesHelpers;
