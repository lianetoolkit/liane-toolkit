import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

export const resolveInteraction = new ValidatedMethod({
  name: "entries.resolveInteraction",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    id: {
      type: String
    },
    type: {
      type: String
    }
  }).validator(),
  run({ campaignId, id, type }) {
    logger.debug("entries.resolveInteraction called", {
      campaignId,
      id,
      type
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!_.findWhere(campaign.users, { userId })) {
      throw new Meteor.Error(401, "You are not part of this campaign");
    }

    let InteractionModel;

    if (type == "comment") {
      InteractionModel = Comments;
    } else if (type == "reaction") {
      InteractionModel = Likes;
    } else {
      throw new Meteor.Error(401, "Invalid interaction type");
    }

    const interaction = InteractionModel.findOne(id);

    if (
      !_.findWhere(campaign.accounts, {
        facebookId: interaction.facebookAccountId
      })
    ) {
      throw new Meteor.Error(
        401,
        "Campaign does not have access to this account"
      );
    }

    InteractionModel.update(interaction._id, {
      $set: {
        resolved: true
      }
    });

    return;
  }
});
