import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import redisClient from "/imports/startup/server/redis";

import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";

import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { AdAccountsHelpers } from "/imports/api/facebook/adAccounts/server/adAccountsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

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
      CampaignsHelpers.suspendAdAccount({ campaignId: campaign._id });
      throw new Meteor.Error("Ad account has no admin users on the app");
    }

    const tokens = adAccountUsers.map(
      user => user.services.facebook.accessToken
    );

    const redisKey = `adaccount::${adAccountId}::adCampaigns`;

    let adCampaigns = redisClient.getSync(redisKey);

    if (!adCampaigns) {
      const res = await _fb.api(`act_${adAccountId}/campaigns`, {
        fields: ["id, name"],
        access_token: tokens[0]
      });
      if (res && res.data) {
        adCampaigns = res.data;
        redisClient.setSync(
          redisKey,
          JSON.stringify(adCampaigns),
          "EX",
          10 * 60
        );
        return adCampaigns;
      }
    } else {
      return JSON.parse(adCampaigns);
    }
  },
  async createAd({
    adCampaign,
    name,
    campaignId,
    facebookAccountId,
    audienceCategoryId,
    geolocationId,
    useConnection,
    billingEvent
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

    const adAccountUsers = AdAccountsHelpers.getUsers({ adAccountId });

    adAccountId = adAccountId.replace("act_", "");
    if (!adAccountUsers.length) {
      CampaignsHelpers.suspendAdAccount({ campaignId: campaign._id });
      throw new Meteor.Error("Ad account has no admin users on the app");
    }

    const tokens = adAccountUsers.map(
      user => user.services.facebook.accessToken
    );

    let targeting = {
      geo_locations: FacebookAudiencesHelpers.buildLocations(geolocation)
    };

    if (useConnection) {
      targeting["connections"] = [facebookAccountId];
    }

    let config = {
      access_token: tokens[0],
      campaign_id: adCampaign,
      account_id: facebookAccountId,
      billing_event: billingEvent,
      bid_amount: 2,
      optimization_goals: "PAGE_ENGAGEMENT",
      targeting,
      name
    };

    console.log(config);

    return await _fb.api(`act_${adAccountId}/adsets`, "post", config);
  }
};

exports.AdsHelpers = AdsHelpers;
