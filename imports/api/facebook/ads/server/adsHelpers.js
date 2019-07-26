import { Promise } from "meteor/promise";
import redisClient from "/imports/startup/server/redis";

import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { AdAccountsHelpers } from "/imports/api/facebook/adAccounts/server/adAccountsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";

const AdsHelpers = {
  async getAdCampaigns({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error("Campaign does not exist");
    }

    let adAccountId = campaign.adAccountId;

    if (!adAccountId) {
      throw new Meteor.Error("Campaign doesnt have an ad account");
    }

    const adAccountUsers = AdAccountsHelpers.getUsers({ adAccountId });

    adAccountId = adAccountId.replace("act_", "");
    if (!adAccountUsers.length) {
      // CampaignsHelpers.suspendAdAccount({ campaignId: campaign._id });
      throw new Meteor.Error("Ad account has no admin users on the app");
    }

    const tokens = adAccountUsers.map(
      user => user.services.facebook.accessToken
    );

    const suspendedKey = `adaccount::${adAccountId}::suspended`;
    const redisKey = `adaccount::${adAccountId}::adCampaigns`;

    const suspended = redisClient.getSync(suspendedKey);
    let adCampaigns = redisClient.getSync(redisKey);

    if (suspended) {
      if (!adCampaigns)
        throw new Meteor.Error(
          500,
          "Service unavailable. Try again in a few minutes."
        );
      else return JSON.parse(adCampaigns);
    }

    try {
      const res = await FB.api(`act_${adAccountId}/campaigns`, {
        fields: ["id, name"],
        access_token: tokens[0]
      });
      if (res && res.data) {
        adCampaigns = res.data;
        redisClient.setSync(redisKey, JSON.stringify(adCampaigns));
        return adCampaigns;
      }
    } catch (error) {
      if (adCampaigns) {
        return JSON.parse(adCampaigns);
      } else {
        throw new Meteor.Error(
          500,
          "Service unavailable. Try again in a few minutes."
        );
      }
    }
  },
  async createAd({
    name,
    campaignId,
    facebookAccountId,
    audienceCategoryId,
    geolocationId,
    useConnection,
    adConfig
  }) {
    const campaign = Campaigns.findOne(campaignId);
    const category = AudienceCategories.findOne(audienceCategoryId);
    const geolocation = Geolocations.findOne(geolocationId);

    name = name || `${category.title} in ${geolocation.name}`;

    if (!campaign) {
      throw new Meteor.Error("Campaign does not exist");
    }

    let adAccountId = campaign.adAccountId;

    if (!adAccountId) {
      throw new Meteor.Error("Campaign doesnt have an ad account");
    }

    if (
      !adConfig.billing_event ||
      !adConfig.bid_amount ||
      !adConfig.optimization_goals ||
      !adConfig.daily_budget
    ) {
      throw new Meteor.Error("All fields are required.");
    }

    const adAccountUsers = AdAccountsHelpers.getUsers({ adAccountId });

    adAccountId = adAccountId.replace("act_", "");
    if (!adAccountUsers.length) {
      // CampaignsHelpers.suspendAdAccount({ campaignId: campaign._id });
      throw new Meteor.Error("Ad account has no admin users on the app");
    }

    const tokens = adAccountUsers.map(
      user => user.services.facebook.accessToken
    );

    let targeting = {
      geo_locations: FacebookAudiencesHelpers.buildLocations(geolocation),
      interests: category.spec.interests.map(interest => {
        return {
          id: interest.id,
          name: interest.name
        };
      })
    };

    if (useConnection) {
      targeting["connections"] = [facebookAccountId];
    }

    let config = {
      access_token: tokens[0],
      account_id: facebookAccountId,
      targeting,
      name,
      ...adConfig
    };

    try {
      return await FB.api(`act_${adAccountId}/adsets`, "post", config);
    } catch (e) {
      const error = e.response.error;
      throw new Meteor.Error(
        error.error_user_title,
        error.error_user_msg,
        error
      );
    }
  }
};

exports.AdsHelpers = AdsHelpers;
