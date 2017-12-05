import { Promise } from "meteor/promise";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
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
  fetchAudienceByAccount({ campaignId, facebookAccountId }) {
    check(facebookAccountId, String);

    logger.debug("AudienceCategoriesHelpers.fetchAudienceCategoriesByAccount", {
      campaignId,
      facebookAccountId
    });

    const campaign = Campaigns.findOne(campaignId);
    const context = Contexts.findOne(campaign.contextId);
    const categories = AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    }).fetch();

    for (const cat of categories) {
      JobsHelpers.addJob({
        jobType: "audiences.fetchAudienceByCategory",
        jobData: {
          contextId: context._id,
          facebookAccountId: facebookAccountId,
          audienceCategoryId: cat._id
        }
      });
    }
  },
  fetchAudienceByCategory({ contextId, facebookAccountId, audienceCategoryId }) {
    check(contextId, String);
    check(facebookAccountId, String);
    check(audienceCategoryId, String);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceByCategory", {
      facebookAccountId,
      audienceCategoryId
    });

    const audienceCategory = AudienceCategories.findOne(audienceCategoryId);

    const spec = audienceCategory.spec;

    FacebookAudiencesHelpers.fetchContextAudiences({
      contextId,
      facebookAccountId,
      audienceCategoryId,
      spec
    });

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
    for (const location of context.geolocations) {
      const geoLoc = Geolocations.findOne(location);
      spec["geo_locations"] = {};
      spec.geo_locations[
        FacebookAudiencesHelpers._getRegionFacebookType({
          type: geoLoc.facebookType
        })
      ] = [{ key: geoLoc.facebookKey }];

      response = FacebookAudiencesHelpers.fetchAudienceByLocation({
        facebookAccountId,
        spec
      });

      if (response) {
        FacebookAudiences.upsert(
          {
            facebookAccountId: facebookAccountId,
            audienceCategoryId: audienceCategoryId,
            fetch_date: moment().format("YYYY-MM-DD"),
            geoLocationId: geoLoc._id
          },
          { $set: response.result }
        );
        logger.debug("fetchContextAudiences result", { response });
      }
    }
  },
  fetchAudienceByLocation({ facebookAccountId, spec }) {
    check(facebookAccountId, String);
    check(spec, Object);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceByLocation", {
      facebookAccountId,
      spec
    });

    const admin = Meteor.users.findOne({
      "services.facebook.id": options.admin
    });

    if (!admin) {
      return { error: "Admin does not exist." };
    }

    const accessToken = admin.services.facebook.accessToken;

    spec["connections"] = [facebookAccountId];

    const fetch = function(spec) {
      return Promise.await(
        _fb.api(route, {
          targeting_spec: spec,
          access_token: accessToken
        })
      ).data.users;
    };

    let result = {};

    result["estimate"] = fetch(spec);
    result["total"] = fetch(_.omit(spec, "interests"));
    result["location_estimate"] = fetch(_.omit(spec, "connections"));
    result["location_total"] = fetch(_.omit(spec, "interests", "connections"));

    logger.debug("fetchAudienceByLocation result", { result });

    return { result };
  }
};

exports.FacebookAudiencesHelpers = FacebookAudiencesHelpers;
