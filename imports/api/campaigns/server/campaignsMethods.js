import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "./campaignsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Jobs } from "/imports/api/jobs/jobs.js";
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
    },
    facebookAccountId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ name, description, adAccountId, contextId, facebookAccountId }) {
    logger.debug("campaigns.create called", {
      name,
      description,
      contextId,
      adAccountId,
      facebookAccountId
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

    if (facebookAccountId) {
      const account = FacebookAccountsHelpers.getUserAccount({
        userId,
        facebookAccountId
      });
      CampaignsHelpers.addAccount({ campaignId, account });
      CampaignsHelpers.addAudienceAccount({ campaignId, account });
    }

    return { result: campaignId };
  }
});

export const campaignsUpdate = new ValidatedMethod({
  name: "campaigns.update",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    name: {
      type: String,
      optional: true
    },
    adAccountId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ campaignId, ...data }) {
    logger.debug("campaigns.update called", {
      campaignId,
      data
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

    let runJobs = {};

    if (campaign.adAccountId !== data.adAccountId) {
      const user = Meteor.users.findOne(userId);
      const token = user.services.facebook.accessToken;
      AdAccountsHelpers.update({ adAccountId: data.adAccountId, token });
      data.status = "ok";
      runJobs["audiences"] = true;
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      {
        $set: data
      }
    );

    if (Object.keys(runJobs).length) {
      const facebookAccounts = campaign.accounts.map(acc => acc.facebookId);
      for (const job in runJobs) {
        if (runJobs[job]) {
          for (const facebookAccountId of facebookAccounts) {
            CampaignsHelpers.refreshAccountJob({
              campaignId,
              facebookAccountId,
              type: job
            });
          }
        }
      }
    }
  }
});

export const campaignsRemove = new ValidatedMethod({
  name: "campaigns.remove",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("campaigns.remove called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exists");
    }

    allowed =
      _.findWhere(campaign.users, { userId }) ||
      Roles.userIsInRole(userId, ["admin"]);

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return CampaignsHelpers.removeCampaign({ campaignId });
  }
});

export const campaignsSuspend = new ValidatedMethod({
  name: "campaigns.suspend",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    suspend: {
      type: Boolean
    }
  }).validator(),
  run({ campaignId, suspend }) {
    this.unblock();
    logger.debug("campaigns.suspend called", { campaignId, suspend });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exists");
    }

    allowed = Roles.userIsInRole(userId, ["admin"]);

    if (!allowed) {
      throw new Meteor.Error(403, "Permission denied");
    }

    if (suspend) {
      return CampaignsHelpers.suspendCampaign({ campaignId });
    } else {
      return CampaignsHelpers.activateCampaign({ campaignId });
    }
  }
});

export const addUser = new ValidatedMethod({
  name: "campaigns.addUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    email: {
      type: String
    },
    role: {
      type: String
    }
  }).validator(),
  run({ campaignId, email, role }) {
    logger.debug("campaigns.addUser called", { campaignId, email, role });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exists");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const user = Meteor.users.findOne({
      emails: { $elemMatch: { address: email } }
    });

    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }

    if (_.findWhere(campaign.users, { userId: user._id })) {
      throw new Meteor.Error(401, "User already part of this campaign.");
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $push: { users: { userId: user._id, role } } }
    );
  }
});

export const removeUser = new ValidatedMethod({
  name: "campaigns.removeUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    userId: {
      type: String
    }
  }).validator(),
  run({ campaignId, userId }) {
    logger.debug("campaigns.removeUser called", { campaignId, userId });

    const currentUser = Meteor.userId();
    if (!currentUser) {
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

    if (currentUser == userId) {
      throw new Meteor.Error(401, "You can't remove yourself");
    }

    const campaignUser = _.findWhere(campaign.users, { userId });

    if (!campaignUser) {
      throw new Meteor.Error(401, "User is not part of this campaign.");
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $pull: { users: campaignUser } }
    );
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
    this.unblock();
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
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    CampaignsHelpers.addAccount({ campaignId, account });

    return;
  }
});

export const removeSelfAccount = new ValidatedMethod({
  name: "campaigns.removeSelfAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookId }) {
    logger.debug("campaigns.removeSelfAudienceAccount called", {
      campaignId,
      facebookId
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exists");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    CampaignsHelpers.removeAccount({ campaignId, facebookId });
    return;
  }
});

export const findAndAddSelfAudienceAccount = new ValidatedMethod({
  name: "campaigns.findAndAddSelfAudienceAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    address: {
      type: String
    }
  }).validator(),
  run({ campaignId, address }) {
    this.unblock();
    logger.debug("campaigns.findAndAddSelfAudienceAccount called", {
      campaignId,
      address
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exists");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let account;

    try {
      account = FacebookAccountsHelpers.fetchFBAccount({ userId, address });
      CampaignsHelpers.addAudienceAccount({ campaignId, account });
    } catch (error) {
      if (error instanceof Meteor.Error) {
        throw error;
      } else if (error.response) {
        const errorCode = error.response.error.code;
        if (errorCode == 803) {
          throw new Meteor.Error(404, "Facebook account not found");
        } else {
          throw new Meteor.Error(500, "Unexpected error occurred");
        }
      } else {
        throw new Meteor.Error(500, "Unexpected error occurred");
      }
    }

    return;
  }
});

export const addSelfAudienceAccount = new ValidatedMethod({
  name: "campaigns.addSelfAudienceAccount",
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
    this.unblock();
    logger.debug("campaigns.addSelfAudienceAccount called", {
      campaignId,
      account
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exists");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    CampaignsHelpers.addAudienceAccount({ campaignId, account });

    return;
  }
});

export const removeSelfAudienceAccount = new ValidatedMethod({
  name: "campaigns.removeSelfAudienceAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookId }) {
    this.unblock();
    logger.debug("campaigns.removeSelfAudienceAccount called", {
      campaignId,
      facebookId
    });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exists");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    allowed = _.findWhere(campaign.users, { userId });
    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    CampaignsHelpers.removeAudienceAccount({ campaignId, facebookId });
  }
});

export const refreshAccountJob = new ValidatedMethod({
  name: "campaigns.refreshAccountJob",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookAccountId: {
      type: String
    },
    type: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookAccountId, type }) {
    this.unblock();
    logger.debug("campaigns.refreshAccountJob", {
      campaignId,
      facebookAccountId,
      type
    });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    CampaignsHelpers.refreshAccountJob({ campaignId, facebookAccountId, type });
  }
});
