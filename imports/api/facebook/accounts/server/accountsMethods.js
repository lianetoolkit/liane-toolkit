import SimpleSchema from "simpl-schema";
import { FacebookAccountsHelpers } from "./accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const webhookUpdate = new ValidatedMethod({
  name: "webhookUpdate",
  validate: new SimpleSchema({
    token: {
      type: String
    },
    facebookAccountId: {
      type: String
    },
    data: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validator(),
  run({ token, facebookAccountId, data }) {
    this.unblock();
    logger.debug("facebook.accounts.webhook.update called", {
      facebookAccountId,
      type: data.item,
      verb: data.verb,
      data
    });
    switch (data.item) {
      case "comment":
        CommentsHelpers.handleWebhook({ facebookAccountId, data });
        break;
      case "reaction":
        LikesHelpers.handleWebhook({ facebookAccountId, data });
      default:
    }
    return true;
  }
});

export const getUserAccounts = new ValidatedMethod({
  name: "facebook.accounts.getUserAccounts",
  validate() {},
  run() {
    this.unblock();
    logger.debug("facebook.accounts.getUserAccounts called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    response = FacebookAccountsHelpers.getUserAccounts({ userId });

    return response;
  }
});

export const seachFBAccounts = new ValidatedMethod({
  name: "facebook.accounts.search",
  validate: new SimpleSchema({
    q: {
      type: String
    }
  }).validator(),
  run({ q }) {
    this.unblock();
    logger.debug("facebook.accounts.search called", { q });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    response = FacebookAccountsHelpers.searchFBAccounts({ userId, q });

    return response;
  }
});
