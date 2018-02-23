import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";

export const accountAudienceGeolocationSummary = new ValidatedMethod({
  name: "audiences.accountGeolocationSummary",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookAccountId }) {
    logger.debug("audiences.accountGeolocationSummary", {
      campaignId,
      facebookAccountId
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    const facebookAccount = FacebookAccounts.findOne({
      facebookId: facebookAccountId
    });

    const context = Contexts.findOne(campaign.contextId);

    let result = {
      facebookAccount,
      data: []
    };

    const geolocations = Geolocations.find({
      _id: { $in: context.geolocations }
    }).fetch();

    geolocations.forEach(geolocation => {
      let geolocationData = { geolocation };
      const audience = FacebookAudiences.findOne(
        {
          campaignId,
          facebookAccountId,
          geolocationId: geolocation._id
        },
        { sort: { createdAt: -1 } }
      );
      if(audience) {
        geolocationData.audience = {
          estimate: audience.total,
          total: audience.location_total
        };
        result.data.push(geolocationData);
      }
    });
    return result;
  }
});

export const accountAudienceSummary = new ValidatedMethod({
  name: "audiences.accountSummary",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookAccountId }) {
    logger.debug("audiences.accountSummary", { campaignId, facebookAccountId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    const context = Contexts.findOne(campaign.contextId);

    const categories = AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    }).fetch();
    const geolocations = Geolocations.find({
      _id: { $in: context.geolocations }
    }).fetch();

    let result = [];

    categories.forEach(category => {
      let catData = {
        category,
        geolocations: [],
        audience: FacebookAudiences.findOne(
          {
            campaignId,
            facebookAccountId,
            audienceCategoryId: category._id,
            geolocationId: context.mainGeolocationId
          },
          { sort: { createdAt: -1 } }
        )
      };
      geolocations.forEach(geolocation => {
        const audience = FacebookAudiences.findOne(
          {
            campaignId,
            facebookAccountId,
            audienceCategoryId: category._id,
            geolocationId: geolocation._id
          },
          { sort: { createdAt: -1 } }
        );
        catData.geolocations.push({ geolocation, audience });
      });
      result.push(catData);
    });

    return result;
  }
});

export const accountAudienceByCategory = new ValidatedMethod({
  name: "audiences.byCategory",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    },
    audienceCategoryId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookAccountId, audienceCategoryId }) {
    logger.debug("audiences.byCategory", {
      campaignId,
      facebookAccountId,
      audienceCategoryId
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    const context = Contexts.findOne(campaign.contextId);

    const category = AudienceCategories.findOne(audienceCategoryId);
    const geolocations = Geolocations.find({
      _id: { $in: context.geolocations }
    }).fetch();

    let result = { category, geolocations: [] };

    geolocations.forEach(geolocation => {
      const audiences = FacebookAudiences.find(
        {
          campaignId,
          facebookAccountId,
          audienceCategoryId: category._id,
          geolocationId: geolocation._id
        },
        { sort: { createdAt: 1 } }
      ).fetch();
      result.geolocations.push({ geolocation, audiences });
    });

    return result;
  }
});
