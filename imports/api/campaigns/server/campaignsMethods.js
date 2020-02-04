import SimpleSchema from "simpl-schema";
import { Campaigns, Invites } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "./campaignsHelpers.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { AdAccountsHelpers } from "/imports/api/facebook/adAccounts/server/adAccountsHelpers.js";
import { GeolocationsHelpers } from "/imports/api/geolocations/server/geolocationsHelpers.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;
import _ from "underscore";

import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

const PRIVATE = Meteor.settings.private;

export const canManageCampaign = new ValidatedMethod({
  name: "campaigns.canManage",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    userId: {
      type: String
    }
  }).validator(),
  run({ campaignId, userId }) {
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(401, "User does not exist");
    }
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    return !!_.findWhere(campaign.users, { userId });
  }
});

export const campaignHasAccount = new ValidatedMethod({
  name: "campaigns.hasAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookId }) {
    const campaign = Campaigns.findOne(campaignId);
    return (
      (campaign.facebookAccount &&
        campaign.facebookAccount.facebookId == facebookId) ||
      !!_.findWhere(campaign.accounts, { facebookId })
    );
  }
});

export const campaignsCreate = new ValidatedMethod({
  name: "campaigns.create",
  validate: new SimpleSchema({
    name: {
      type: String
    },
    country: {
      type: String
    },
    geolocation: {
      type: Object,
      optional: true
    },
    "geolocation.osm_id": {
      type: Number
    },
    "geolocation.osm_type": {
      type: String
    },
    "geolocation.type": {
      type: String,
      allowedValues: ["state", "city"]
    },
    facebookAccountId: {
      type: String
    },
    invite: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ name, country, geolocation, facebookAccountId, invite }) {
    logger.debug("campaigns.create called", {
      name,
      country,
      geolocation,
      facebookAccountId,
      invite
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    let hasInvite = false;

    if (PRIVATE && !Roles.userIsInRole(userId, ["admin", "moderator"])) {
      let allow = false;
      if (invite) {
        const inviteData = Invites.findOne({ key: invite, used: false });
        if (inviteData) {
          allow = true;
          hasInvite = true;
        }
      }
      if (!allow)
        throw new Meteor.Error(401, "Campaign creation is currently disabled.");
    }

    if (FacebookAccounts.findOne({ facebookId: facebookAccountId })) {
      throw new Meteor.Error(
        401,
        "This account is already being used by another campaign"
      );
    }

    const users = [{ userId, role: "owner" }];
    let insertDoc = { users, name, country, creatorId: userId };

    const user = Meteor.users.findOne(userId);
    const token = user.services.facebook.accessToken;

    let geolocationId = false;
    if (geolocation) {
      try {
        geolocationId = GeolocationsHelpers.discoverAndStore({
          ...geolocation,
          accessToken: token
        });
      } catch (e) {
        throw new Meteor.Error(500, "Unexpected error, please try again");
      }
    }

    if (geolocationId) {
      insertDoc.geolocationId = geolocationId;
    }

    const account = FacebookAccountsHelpers.getUserAccount({
      userId,
      facebookAccountId
    });

    const accountToken = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token
    });

    insertDoc.facebookAccount = {
      facebookId: account.id,
      accessToken: accountToken.result,
      chatbot: {
        active: false,
        init_text_response: false
      }
    };

    campaignId = Campaigns.insert(insertDoc);

    CampaignsHelpers.setMainAccount({ campaignId, account });
    // CampaignsHelpers.addAccount({ campaignId, account });
    // CampaignsHelpers.addAudienceAccount({ campaignId, account });

    if (hasInvite) {
      Invites.update(
        { key: invite },
        {
          $set: { used: true, usedBy: userId }
        }
      );
    }

    Meteor.call("log", {
      type: "campaigns.add",
      campaignId,
      data: { name }
    });

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
    },
    autoReplyMessage: {
      type: String,
      optional: true
    },
    forms: {
      type: Object,
      optional: true
    },
    "forms.slug": {
      type: String,
      optional: true,
      unique: true
    },
    "forms.crm": {
      type: Object,
      optional: true
    },
    "forms.crm.language": {
      type: String,
      optional: true
    },
    "forms.crm.header": {
      type: String
    },
    "forms.crm.text": {
      type: String
    },
    "forms.crm.thanks": {
      type: String
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

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "Not allowed");
    }

    let $set = {};

    let runJobs = {};

    if (data.name) {
      $set.name = data.name;
    }

    if (data.autoReplyMessage) {
      $set.autoReplyMessage = data.autoReplyMessage;
    }

    if (data.adAccountId && campaign.adAccountId !== data.adAccountId) {
      const user = Meteor.users.findOne(userId);
      const token = user.services.facebook.accessToken;
      AdAccountsHelpers.update({ adAccountId: data.adAccountId, token });
      $set.adAccountId = data.adAccountId;
      $set.status = "ok";
      runJobs["audiences"] = true;
    }

    if (data.forms) {
      if (data.forms.slug) {
        const minimumLength = 5;
        const reservedSlugs = [
          "admin",
          "campaign",
          "f",
          "people",
          "map",
          "canvas",
          "user",
          "settings",
          "help",
          "support"
        ];
        if (
          data.forms.slug.length < minimumLength ||
          reservedSlugs.indexOf(data.forms.slug) !== -1
        ) {
          throw new Meteor.Error(400, "Form slug is not valid.");
        }
        if (
          Campaigns.find({
            "forms.slug": data.forms.slug,
            _id: { $nin: [campaign._id] }
          }).fetch().length
        ) {
          throw new Meteor.Error(400, "Slug already in use");
        }
        $set["forms.slug"] = data.forms.slug;
      } else {
        $set["forms.slug"] = "";
      }
      if (data.forms.crm) {
        $set["forms.crm"] = data.forms.crm;
      }
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $set }
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const allowed =
      campaign.creatorId == userId || Roles.userIsInRole(userId, ["admin"]);

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const res = CampaignsHelpers.removeCampaign({ campaignId });

    Meteor.call("log", {
      type: "campaigns.remove",
      campaignId,
      data: { name: campaign.name }
    });

    return res;
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Permission denied");
    }

    if (suspend) {
      return CampaignsHelpers.suspendCampaign({ campaignId });
    } else {
      return CampaignsHelpers.activateCampaign({ campaignId });
    }
  }
});

export const campaignsRefreshAllJobs = new ValidatedMethod({
  name: "campaigns.refreshAllJobs",
  validate: new SimpleSchema({
    type: {
      type: String,
      optional: true
    }
  }).validator(),
  run() {
    logger.debug("campaigns.refreshAllJobs called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Permission denied");
    }

    Jobs.remove({});

    const campaigns = Campaigns.find({ status: { $ne: "suspended" } }).fetch();

    for (let campaign of campaigns) {
      CampaignsHelpers.refreshCampaignJobs({ campaignId: campaign._id });
    }

    return;
  }
});

export const campaignRefreshHealthCheck = new ValidatedMethod({
  name: "campaigns.refreshHealthCheck",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("campaigns.refreshHealthCheck", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const allowed =
      campaign.creatorId == userId || Roles.userIsInRole(userId, ["admin"]);

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return CampaignsHelpers.refreshHealthCheck({ campaignId });
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
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

    Meteor.call("log", {
      type: "campaigns.users.add",
      campaignId,
      data: { userId: user._id }
    });
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

    const campaign = Campaigns.findOne(campaignId);

    if (
      !Meteor.call("campaigns.canManage", { userId: currentUser, campaignId })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (currentUser == userId) {
      throw new Meteor.Error(401, "You can't remove yourself");
    }

    if (userId == campaign.creatorId) {
      throw new Meteor.Error(
        401,
        "You can't remove the creator of the campaign"
      );
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

    Meteor.call("log", {
      type: "campaigns.users.remove",
      campaignId,
      data: { userId }
    });
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    CampaignsHelpers.removeAccount({ campaignId, facebookId });
    return;
  }
});

// DEPRECATED
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

    throw new Meteor.Error(500, "This method is unavailable");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
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

// DEPRECATED
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

    throw new Meteor.Error(500, "This method is unavailable");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
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

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
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

export const campaignCounts = new ValidatedMethod({
  name: "campaigns.counts",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("campaigns.counts", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "This campaign does not exist");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (!campaign.facebookAccount) {
      throw new Meteor.Error(400, "Facebook Account not found");
    }

    const account = FacebookAccounts.findOne({
      facebookId: campaign.facebookAccount.facebookId
    });

    if (!account) {
      throw new Meteor.Error(400, "Facebook Account not found");
    }

    let counts = {};

    counts["people"] = People.find({ campaignId }).count();
    counts["comments"] = Comments.find({
      facebookAccountId: account.facebookId
    }).count();
    counts["likes"] = Likes.find({
      facebookAccountId: account.facebookId,
      parentId: { $exists: false }
    }).count();

    return counts;
  }
});

export const campaignQueryCount = new ValidatedMethod({
  name: "campaigns.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validator(),
  run({ query }) {
    return Campaigns.find(query || {}).count();
  }
});

export const inviteQueryCount = new ValidatedMethod({
  name: "invites.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validator(),
  run({ query }) {
    return Invites.find(query || {}).count();
  }
});

export const createInvite = new ValidatedMethod({
  name: "invites.new",
  validate() {},
  run() {
    this.unblock();
    logger.debug("invites.new called");

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    return Invites.insert({});
  }
});

export const designateInvite = new ValidatedMethod({
  name: "invites.designate",
  validate: new SimpleSchema({
    inviteId: {
      type: String
    },
    designated: {
      type: String
    }
  }).validator(),
  run({ inviteId, designated }) {
    this.unblock();
    logger.debug("invites.designate called", { inviteId });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    const invite = Invites.findOne(inviteId);

    if (!invite) {
      throw new Meteor.Error(404, "Invite not found");
    }

    Invites.update(inviteId, { $set: { designated } });

    return;
  }
});

export const removeInvite = new ValidatedMethod({
  name: "invites.remove",
  validate: new SimpleSchema({
    inviteId: {
      type: String
    }
  }).validator(),
  run({ inviteId }) {
    this.unblock();
    logger.debug("invites.remove called", { inviteId });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    const invite = Invites.findOne(inviteId);

    if (!invite) {
      throw new Meteor.Error(404, "Invite not found");
    }

    Invites.remove(inviteId);

    return;
  }
});
