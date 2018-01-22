import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "./campaignsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { AdAccountsHelpers } from "/imports/api/facebook/adAccounts/server/adAccountsHelpers.js";
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
    adAccountId: {
      type: String
    },
    contextId: {
      type: String
    }
  }).validator(),
  run({ name, description, adAccountId, contextId }) {
    logger.debug("campaigns.create called", {
      name,
      description,
      contextId,
      adAccountId
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    const users = [{ userId, role: "owner" }];
    const insertDoc = { users, name, description, contextId, adAccountId };

    const user = Meteor.users.findOne(userId);
    const token = user.services.facebook.accessToken;

    AdAccountsHelpers.update({ adAccountId, token });

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
    logger.debug("campaigns.addSelfAccount called", {
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
    CampaignsHelpers.addAccountToCampaign({ campaignId, account });

    return;
  }
});

export const updateAccount = new ValidatedMethod({
  name: "campaigns.updateAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String
    },
    action: {
      type: String,
      allowedValues: ["people", "audience"]
    }
  }).validator(),
  run({ campaignId, facebookId, action }) {
    logger.debug("campaigns.updateAccount called", {
      campaignId,
      facebookId,
      action
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const account = _.findWhere(campaign.accounts, { facebookId: facebookId });
    if (action == "people") {
      JobsHelpers.addJob({
        jobType: "entries.updateAccountEntries",
        jobData: {
          facebookId: facebookId,
          accessToken: account.accessToken,
          campaignId: campaignId
        }
      });
    }
    if (action == "audience") {
      JobsHelpers.addJob({
        jobType: "audiences.updateAccountAudience",
        jobData: {
          campaignId: campaign._id,
          facebookAccountId: facebookId
        }
      });
    }

    return;
  }
});
