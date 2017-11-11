import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;
import _ from "underscore";

export const campaignsCreate = new ValidatedMethod({
  name: "campaigns.create",
  validate: new SimpleSchema({
    name: {
      type: String
    },
    description: {
      type: String
    },
    contextId: {
      type: String
    }
  }).validator(),
  run({ name, description, contextId }) {
    logger.debug("campaigns.create called", { name, description, contextId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    const users = [{ userId, role: "owner" }];
    const insertDoc = { users, name, description, contextId };

    campaignId = Campaigns.insert(insertDoc);
    return { result: campaignId };
  }
});

export const addSelfAccount = new ValidatedMethod({
  name: "campaigns.addSelfAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    account: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, account }) {
    logger.debug("facebook.accounts.addSelfAccount called", {
      campaignId,
      account
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exists");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    const updateObj = {
      facebookId: account.id,
      accessToken: account.access_token
    };

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { accounts: updateObj } }
    );

    const insertObj = {
      facebookId: account.id,
      name: account.name,
      category: account.category
    };
    FacebookAccounts.insert(insertObj);

    return;
  }
});
