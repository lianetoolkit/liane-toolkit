import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

export const queryCount = new ValidatedMethod({
  name: "comments.queryCount",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    query: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, facebookId, query }) {
    logger.debug("comments.queryCount", { campaignId });

    const userId = Meteor.userId();

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign.facebookAccount) {
      throw new Meteor.Error(400, "Facebook account not found");
    }

    const facebookAccountId = campaign.facebookAccount.facebookId;

    return Comments.find({
      ...query,
      facebookAccountId,
      created_time: { $exists: true },
    }).count();
  },
});

export const reactComment = new ValidatedMethod({
  name: "comments.react",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    commentId: {
      type: String,
    },
    reaction: {
      type: String,
    },
  }).validator(),
  run({ campaignId, commentId, reaction }) {
    this.unblock();
    logger.debug("comments.react called", { commentId, reaction });

    const userId = Meteor.userId();

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);
    const comment = Comments.findOne(commentId);

    if (
      !campaign.facebookAccount ||
      campaign.facebookAccount.facebookId != comment.facebookAccountId
    ) {
      throw new Meteor.Error(400, "Not allowed");
    }
  },
});

export const resolveComment = new ValidatedMethod({
  name: "comments.resolve",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    commentId: {
      type: String,
    },
    resolve: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run({ campaignId, commentId, resolve }) {
    logger.debug("comments.resolve called", { campaignId, commentId, resolve });

    const userId = Meteor.userId();

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "categorize",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);

    const facebookAccountId = campaign.facebookAccount.facebookId;

    const comment = Comments.findOne(commentId);

    if (comment.facebookAccountId !== facebookAccountId) {
      throw new Meteor.Error(401, "Permission denied");
    }

    const res = Comments.update(commentId, {
      $set: {
        resolved: typeof resolve != "undefined" ? resolve : true,
      },
    });

    Meteor.call("log", {
      type: resolve ? "comments.resolve" : "comments.unresolve",
      campaignId,
      data: { commentId },
    });

    return res;
  },
});

export const categorizeComment = new ValidatedMethod({
  name: "comments.updateCategories",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    commentId: {
      type: String,
    },
    categories: {
      type: Array,
    },
    "categories.$": {
      type: String,
      allowedValues: ["question", "vote"],
    },
  }).validator(),
  run({ campaignId, commentId, categories }) {
    logger.debug("comments.updateCategories called", { commentId, categories });

    const userId = Meteor.userId();

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "categorize",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);
    const comment = Comments.findOne(commentId);

    if (!comment) {
      throw new Meteor.Error(404, "Comment not found");
    }
    if (campaign.facebookAccount.facebookId != comment.facebookAccountId) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    Comments.update(commentId, {
      $set: {
        categories,
      },
    });

    Meteor.call("log", {
      type: "comments.tag",
      campaignId,
      data: { commentId, categories },
    });
  },
});

export const sendComment = new ValidatedMethod({
  name: "comments.send",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    objectId: {
      type: String,
    },
    message: {
      type: String,
    },
  }).validator(),
  run({ campaignId, objectId, message }) {
    this.unblock();
    logger.debug("comments.send called", { campaignId, objectId });

    const userId = Meteor.userId();

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);

    const access_token = campaign.facebookAccount.accessToken;

    const comment = Comments.findOne({_id: objectId});
    
    switch (comment.source) {
      case 'instagram':
        try {
          Promise.await(
            FB.api(`${objectId}/replies`, "POST", {
              message,
              access_token,
            })
          );
        } catch (err) {
          console.log(err);
          throw new Meteor.Error(500, "Error trying to publish comment");
        }
    
        break;
      default: //Facebook

        try {
          Promise.await(
            FB.api(`${objectId}/comments`, "POST", {
              message,
              access_token,
            })
          );
        } catch (err) {
          console.log(err);
          throw new Meteor.Error(500, "Error trying to publish comment");
        }
    
        break;
    }

    Meteor.call("log", {
      type: "comments.reply",
      campaignId,
      data: { commentId: objectId },
    });

    return;
  },
});
