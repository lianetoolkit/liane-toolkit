import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

export const categorizeComment = new ValidatedMethod({
  name: "comments.updateCategories",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    commentId: {
      type: String
    },
    categories: {
      type: Array
    },
    "categories.$": {
      type: String,
      allowedValues: ["question", "vote"]
    }
  }).validator(),
  run({ campaignId, commentId, categories }) {
    logger.debug("comments.updateCategories called", { commentId, categories });

    const userId = Meteor.userId();

    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);
    const comment = Comments.findOne(commentId);

    if (!comment) {
      throw new Meteor.Error(404, "Comment not found");
    }
    if (
      !_.findWhere(campaign.accounts, { facebookId: comment.facebookAccountId })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    Comments.update(commentId, {
      $set: {
        categories
      }
    });
  }
});
