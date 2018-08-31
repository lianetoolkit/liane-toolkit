import { Promise } from "meteor/promise";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { AdAccounts } from "/imports/api/facebook/adAccounts/adAccounts.js";
import { AdAccountsHelpers } from "/imports/api/facebook/adAccounts/server/adAccountsHelpers.js";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Jobs } from "/imports/api/jobs/jobs";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import redisClient, { deleteByPattern } from "/imports/startup/server/redis";
import crypto from "crypto";
import _ from "underscore";
import moment from "moment";

const FacebookAudiencesHelpers = {
  async getFanCount(facebookId, token) {
    try {
      const res = await FB.api(facebookId, {
        fields: ["fan_count"],
        access_token: token
      });
      return res.fan_count;
    } catch (e) {
      console.log(e);
      return 0;
    }
  },
  _getTokens({ adAccountId, campaignId }) {
    const adAccountUsers = AdAccountsHelpers.getUsers({ adAccountId });
    if (!adAccountUsers.length) {
      CampaignsHelpers.suspendAdAccount({ campaignId: campaignId });
      throw new Meteor.Error("Ad account has no admin users on the app");
    }
    return adAccountUsers.map(user => user.services.facebook.accessToken);
  },
  async updateAccountAudience({ campaignId, facebookAccountId }) {
    check(facebookAccountId, String);

    logger.debug("AudienceCategoriesHelpers.updateAccountAudience", {
      campaignId,
      facebookAccountId
    });

    const campaign = Campaigns.findOne(campaignId);
    const adAccountId = campaign.adAccountId;
    const context = Contexts.findOne(campaign.contextId);
    const audienceCategories = AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    }).fetch();

    if (!adAccountId) {
      CampaignsHelpers.suspendAdAccount({ campaignId: campaign._id });
      throw new Meteor.Error("Campaign has no ad account.");
    }

    // Validate token
    const tokens = this._getTokens({ adAccountId, campaignId: campaign._id });

    // Update adAccount data
    AdAccountsHelpers.update({ adAccountId, token: tokens[0] });

    const fanCount = await this.getFanCount(facebookAccountId, tokens[0]);
    if (fanCount) {
      FacebookAccounts.update(
        {
          facebookId: facebookAccountId
        },
        {
          $set: {
            fanCount
          }
        }
      );
    }

    let jobIds = [];
    for (const audienceCategory of audienceCategories) {
      jobIds = jobIds.concat(
        FacebookAudiencesHelpers.fetchAudienceByCategory({
          contextId: context._id,
          campaignId: campaign._id,
          adAccountId,
          audienceCategoryId: audienceCategory._id,
          facebookAccountId
        })
      );
    }

    logger.debug("AudienceCategoriesHelpers.updateAccountAudience jobIds", {
      jobIds
    });

    return;

    // Wait jobs to finish
    // return await new Promise(resolve => {
    //   let completionMap = {};
    //   const query = Jobs.find({
    //     _id: { $in: jobIds }
    //   });
    //   query.observe({
    //     removed: function(job) {
    //       completionMap[job._id] = true;
    //       if (Object.keys(completionMap).length == jobIds.length) {
    //         resolve();
    //       }
    //     }
    //   });
    //   const jobs = query.fetch();
    //   if(!jobs.length) {
    //     resolve();
    //   }
    // });
  },
  fetchAudienceByCategory({
    contextId,
    campaignId,
    adAccountId,
    facebookAccountId,
    audienceCategoryId
  }) {
    check(contextId, String);
    check(campaignId, String);
    check(adAccountId, String);
    check(facebookAccountId, String);
    check(audienceCategoryId, String);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceByCategory", {
      contextId,
      campaignId,
      adAccountId,
      facebookAccountId,
      audienceCategoryId
    });

    const audienceCategory = AudienceCategories.findOne(audienceCategoryId);

    let spec = audienceCategory.spec;

    if (spec.interests)
      spec.interests = spec.interests.map(interest => interest.id);

    const jobIds = FacebookAudiencesHelpers.fetchContextAudiences({
      contextId,
      campaignId,
      adAccountId,
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
  buildLocations(geolocation) {
    if (
      (!geolocation.type || geolocation.type == "location") &&
      geolocation.facebook
    ) {
      return this._buildFacebookLocations({
        locations: geolocation.facebook
      });
    } else if (geolocation.type == "center") {
      return this._buildFacebookCustomLocations({
        center: geolocation.center
      });
    }
    return false;
  },
  _buildFacebookLocations({ locations }) {
    if (!Array.isArray(locations)) {
      locations = [locations];
    }
    let geolocations = {};
    locations.forEach(location => {
      const type = this._getRegionFacebookType({ type: location.type });
      const key = location.key;
      if (!geolocations[type]) geolocations[type] = [];
      if (type == "countries") {
        geolocations[type].push(key);
      } else {
        geolocations[type].push({ key });
      }
    });
    return geolocations;
  },
  _buildFacebookCustomLocations({ center }) {
    return {
      custom_locations: [
        {
          latitude: center.center[0],
          longitude: center.center[1],
          radius: center.radius,
          distance_unit: "kilometer"
        }
      ]
    };
  },
  fetchContextAudiences({
    contextId,
    campaignId,
    adAccountId,
    facebookAccountId,
    audienceCategoryId,
    spec
  }) {
    check(contextId, String);
    check(campaignId, String);
    check(adAccountId, String);
    check(facebookAccountId, String);
    check(audienceCategoryId, String);
    check(spec, Object);

    logger.debug("FacebookAudiencesHelpers.fetchContextAudiences", {
      contextId,
      campaignId,
      adAccountId,
      facebookAccountId,
      audienceCategoryId,
      spec
    });

    const context = Contexts.findOne(contextId);
    if (!context) {
      return { error: "Context does not exists" };
    }

    let jobIds = [];

    // Main geolocation
    if (context.mainGeolocationId) {
      const mainGeolocation = Geolocations.findOne(context.mainGeolocationId);
      spec["geo_locations"] = this.buildLocations(mainGeolocation);
      jobIds.push(
        JobsHelpers.addJob({
          jobType: "audiences.fetchAndCreateSpecAudience",
          jobData: {
            campaignId,
            adAccountId,
            facebookAccountId,
            geolocationId: context.mainGeolocationId,
            audienceCategoryId,
            spec
          }
        })
      );
    }

    // Context geolocations
    for (const geolocationId of context.geolocations) {
      const geolocation = Geolocations.findOne(geolocationId);
      spec["geo_locations"] = this.buildLocations(geolocation);

      const jobId = JobsHelpers.addJob({
        jobType: "audiences.fetchAndCreateSpecAudience",
        jobData: {
          campaignId,
          adAccountId,
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
  errorHandle(error, payload) {
    if (error instanceof Meteor.Error) {
      throw error;
    } else if (error.response) {
      const errorCode = error.response.error.code;
      switch (errorCode) {
        case 17: // Ad account rate limite
          redisClient.setSync(
            `adaccount::${payload.adAccountId}::suspended`,
            true,
            "EX",
            10 * 60 // 10 minutes
          );
          break;
        case 100: // Facebook random error (happened when user is no longer part of the adaccount)
        case 273: // Token not admin or ad account does not exist (?)
        case 272:
        case 200:
        case 2641:
          CampaignsHelpers.suspendAdAccount({ campaignId: payload.campaignId });
          AdAccountsHelpers.removeUserByToken({
            token: payload.accessToken,
            adAccountId: payload.adAccountId
          });
          break;
      }
    }
    throw new Meteor.Error(error);
  },
  validateRequest({ campaignId, adAccountId, accessToken, facebookAccountId }) {
    const campaign = Campaigns.findOne(campaignId);
    const adAccount = AdAccounts.findOne(adAccountId);
    const user = UsersHelpers.getUserByToken({ token: accessToken });
    if (!user) {
      throw new Meteor.Error("fatal", "User token has changed.");
    }
    if (!campaign) {
      throw new Meteor.Error("fatal", "Campaign does not exist");
    }
    if (campaign.status == "suspended") {
      throw new Meteor.Error("fatal", "Campaign suspended");
    }
    if (!campaign.adAccountId) {
      throw new Meteor.Error("fatal", "Campaign does not have an ad account");
    }
    if (!adAccount) {
      throw new Meteor.Error("fatal", "Ad account does not exist");
    }
    if (campaign.adAccountId.replace("act_", "") !== adAccountId) {
      throw new Meteor.Error("fatal", "Campaign ad account changed");
    }
    if (!adAccount.users.find(u => u.id == user.services.facebook.id)) {
      throw new Meteor.Error("fatal", "User not part of this ad account");
    }
  },
  validateResultByAvg({
    facebookAccountId,
    audienceCategoryId,
    geolocationId,
    data,
    key
  }) {
    const audiences = FacebookAudiences.find({
      facebookAccountId,
      audienceCategoryId,
      geolocationId
    }).fetch();
    if (!audiences.length) return data;
    let total = 0;
    let amount = 0;
    for (const audience of audiences) {
      if (audience[key] && audience[key].dau) {
        total += audience[key].dau;
        amount++;
      }
    }
    const avg = total / amount;
    if (avg > 999 && !data.dau) {
      throw new Meteor.Error(500, "Error fetching daily active users estimate");
    }
    const distance = data.dau / avg;
    if (avg > 999 && (distance < 0.1 || distance > 10)) {
      throw new Meteor.Error(500, "Inconsistent daily active users estimate");
    }
    return data;
  },
  async fetchAndCreateSpecAudience({
    campaignId,
    adAccountId,
    facebookAccountId,
    geolocationId,
    audienceCategoryId,
    spec
  }) {
    // logger.debug("FacebookAudiencesHelpers.fetchAndCreateSpecAudience", {
    //   campaignId,
    //   adAccountId,
    //   facebookAccountId,
    //   geolocationId,
    //   audienceCategoryId,
    //   spec
    // });

    check(campaignId, String);
    check(adAccountId, String);
    check(facebookAccountId, String);
    check(geolocationId, String);
    check(audienceCategoryId, String);
    check(spec, Object);

    const tokens = this._getTokens({ adAccountId, campaignId });
    // Update adAccount data
    // AdAccountsHelpers.update({ adAccountId, token: tokens[0] });

    if (adAccountId.indexOf("act_") === 0) {
      adAccountId = adAccountId.replace("act_", "");
    }

    const errorHandle = this.errorHandle;

    const accessToken = tokens[0];

    const fetchDate = moment().format("YYYY-MM-DD");

    this.validateRequest({
      campaignId,
      adAccountId,
      accessToken,
      facebookAccountId
    });

    spec["connections"] = [facebookAccountId];

    const sleep = ms =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      });

    let validateResultByAvg = this.validateResultByAvg;

    const fetch = async function(spec, key) {
      const hash = crypto
        .createHash("sha1")
        .update(JSON.stringify(spec) + fetchDate)
        .digest("hex");
      const redisKey = `audiences::fetch::${hash}`;
      try {
        let ready = false;
        let res = redisClient.getSync(redisKey);
        if (res) {
          const data = JSON.parse(res).data;
          return {
            dau: data[0].estimate_dau,
            mau: data[0].estimate_mau
          };
        } else {
          let suspended = redisClient.getSync(
            `adaccount::${adAccountId}::suspended`
          );
          if (suspended) {
            throw new Meteor.Error("rate-limit", "Ad account rate limited");
          }
          let multiplier = 1;
          while (ready === false) {
            res = await FB.api(`act_${adAccountId}/delivery_estimate`, {
              optimization_goal: "NONE",
              targeting_spec: spec,
              access_token: accessToken
            });
            ready = res.data[0].estimate_ready;
            await sleep(2000 * multiplier);
            multiplier = multiplier + 0.5;
          }
          if (res.data[0]) {
            const data = {
              dau: res.data[0].estimate_dau,
              mau: res.data[0].estimate_mau
            };
            validateResultByAvg({
              facebookAccountId,
              audienceCategoryId,
              geolocationId,
              data: data,
              key
            });
            redisClient.setSync(
              redisKey,
              JSON.stringify(res),
              "EX",
              6 * 60 * 60
            );
            return data;
          }
        }
      } catch (error) {
        errorHandle(error, {
          campaignId,
          adAccountId,
          facebookAccountId,
          accessToken
        });
      }
    };

    const reqs = {
      estimate: [],
      total: ["interests"],
      location_estimate: ["connections"],
      location_total: ["interests", "connections"]
    };

    let result = {};

    for (const key in reqs) {
      let req;
      if (reqs[key].length) {
        req = _.omit(spec, reqs[key]);
      } else {
        req = spec;
      }
      result[key] = await fetch(req, key);
    }

    const _getFanCount = async () => {
      const redisKey = `audiences::fanCount::${facebookAccountId}`;
      let fanCount = redisClient.getSync(redisKey);
      if (!fanCount) {
        fanCount = await this.getFanCount(facebookAccountId, accessToken);
        redisClient.setSync(redisKey, fanCount, "EX", 10 * 60); // 10 minutes expiration
      }
      return fanCount;
    };

    const fanCount = await _getFanCount();
    if (fanCount) result["fan_count"] = fanCount;

    // Clean up methods cache
    const keys = [
      campaignId,
      campaignId + geolocationId,
      campaignId + audienceCategoryId,
      campaignId + facebookAccountId,
      campaignId + facebookAccountId + audienceCategoryId,
      campaignId + facebookAccountId + geolocationId
    ];
    for (const key of keys) {
      const hash = crypto
        .createHash("sha1")
        .update(key)
        .digest("hex");
      deleteByPattern(`audiences::result::${hash}::*`);
    }

    return FacebookAudiences.upsert(
      {
        campaignId,
        facebookAccountId,
        audienceCategoryId,
        fetch_date: fetchDate,
        geolocationId: geolocationId
      },
      { $set: result }
    );
  }
};

exports.FacebookAudiencesHelpers = FacebookAudiencesHelpers;
