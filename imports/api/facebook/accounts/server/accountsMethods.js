import SimpleSchema from "simpl-schema";
import { FacebookAccounts } from "../accounts.js";
import { FacebookAccountsHelpers } from "./accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
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
    if (!WEBHOOK_TOKEN || !token) {
      throw new Meteor.Error("Token not available");
    }
    if (WEBHOOK_TOKEN !== token) {
      throw new Meteor.Error("Invalid token");
    }
    logger.debug("facebook.accounts.webhook.update called", {
      facebookAccountId,
      data
    });
    // Validate facebook account
    const account = FacebookAccounts.findOne({ facebookId: facebookAccountId });
    if (!account) {
      // TODO Unsuscribe from `subscribed_apps`
      logger.debug("webhookUpdate received unknown Facebook Account ID");
      return true;
    }
    data.entry.forEach(entry => {
      if (entry.changes) {
        entry.changes.forEach(item => {
          switch (item.value.item) {
            case "comment":
              CommentsHelpers.handleWebhook({
                facebookAccountId,
                data: item.value
              });
              break;
            case "reaction":
              LikesHelpers.handleWebhook({
                facebookAccountId,
                data: item.value
              });
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
              EntriesHelpers.handleWebhook({
                facebookAccountId,
                data: item.value
              });
              break;
            default:
          }
        });
      }
    });
    return true;
  }
});

export const getAccountsPublicData = new ValidatedMethod({
  name: "facebook.accounts.public",
  validate() {},
  run() {
    this.unblock();
    return FacebookAccounts.find(
      {},
      {
        fields: {
          name: 1,
          facebookId: 1
        }
      },
      {
        sort: {
          name: 1
        }
      }
    ).fetch();
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

export const updateFBSubscription = new ValidatedMethod({
  name: "accounts.updateFBSubscription",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("accounts.updateFBSubscription called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "Not allowed");
    }

    const facebookAccountId = campaign.facebookAccount.facebookId;
    const token = campaign.facebookAccount.accessToken;

    CampaignsHelpers.refreshCampaignAccountsTokens({
      campaignId
    });

    FacebookAccountsHelpers.updateFBSubscription({ facebookAccountId, token });
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
