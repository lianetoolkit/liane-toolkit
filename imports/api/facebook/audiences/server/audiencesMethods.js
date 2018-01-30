import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";

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
  run({ campaignId, facebookAccountId, groupBy }) {
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
      let catData = { category, geolocations: [] };
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

    // console.log({ campaign, context, categories, geolocations });
    return result;
  }
});
