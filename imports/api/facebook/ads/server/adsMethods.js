import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Campaigns } from "/imports/api/campaigns/campaigns.js";

import { AdsHelpers } from "./adsHelpers.js";

export const getAdCampaigns = new ValidatedMethod({
  name: "ads.getAdCampaigns",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("ads.getAdCampaigns called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    return AdsHelpers.getAdCampaigns({ campaignId });

  }
});

export const createAd = new ValidatedMethod({
  name: "ads.create",
  validate: new SimpleSchema({
    adCampaign: {
      type: String
    },
    name: {
      type: String,
      optional: true
    },
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    },
    audienceCategoryId: {
      type: String
    },
    geolocationId: {
      type: String
    },
    useConnection: {
      type: Boolean
    },
    billingEvent: {
      type: String
    }
  }).validator(),
  run({
    adCampaign,
    name,
    campaignId,
    facebookAccountId,
    audienceCategoryId,
    geolocationId,
    useConnection,
    billingEvent
  }) {
    logger.debug("ads.create called", {
      adCampaign,
      name,
      campaignId,
      facebookAccountId,
      audienceCategoryId,
      geolocationId,
      useConnection,
      billingEvent
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    const ad = AdsHelpers.createAd({
      adCampaign,
      name,
      campaignId,
      facebookAccountId,
      audienceCategoryId,
      geolocationId,
      useConnection,
      billingEvent
    });

    console.log(ad);

    return ad;
  }
});
