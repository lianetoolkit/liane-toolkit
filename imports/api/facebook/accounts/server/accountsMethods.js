import SimpleSchema from "simpl-schema";
import { FacebookAccountsHelpers } from "./accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { EntriesHelpers } from "/imports/api/facebook/entries/server/entriesHelpers.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

const WEBHOOK_TOKEN = Meteor.settings.webhookToken;

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
    if(!WEBHOOK_TOKEN || !token) {
      throw new Meteor.Error("Token not available");
    }
    if(WEBHOOK_TOKEN !== token) {
      throw new Meteor.Error("Invalid token");
    }
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
        break;
      case "album":
      case "address":
      case "coupon":
      case "event":
      case "experience":
      case "group":
      case "group_message":
      case "interest":
      case "link":
      case "milestone":
      case "note":
      case "page":
      case "picture":
      case "platform-story":
      case "photo":
      case "photo-album":
      case "post":
      case "question":
      case "share":
      case "status":
      case "story":
      case "tag":
      case "video":
        EntriesHelpers.handleWebhook({ facebookAccountId, data });
        break;
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
