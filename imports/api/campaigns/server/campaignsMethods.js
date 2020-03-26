import SimpleSchema from "simpl-schema";
import { Random } from "meteor/random";
import mailer, { sendMail } from "/imports/utils/server/mailer";
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
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers";
import _ from "underscore";

import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

import {
  FEATURES,
  PERMISSIONS,
  FEATURE_PERMISSION_MAP
} from "/imports/utils/campaignPermissions";

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
    this.unblock();

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

export const userCan = new ValidatedMethod({
  name: "campaigns.userCan",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    userId: {
      type: String
    },
    feature: {
      type: String
    },
    permission: {
      type: String
    }
  }).validator(),
  run({ campaignId, userId, feature, permission }) {
    this.unblock();

    if (!PERMISSIONS[permission])
      throw new Meteor.Error(404, "Permission not found");

    if (!_.find(FEATURES, f => f == feature))
      throw new Meteor.Error(404, "Feature not found");

    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(401, "User does not exist");
    }
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(401, "This campaign does not exist");
    }

    const campaignUser = _.findWhere(campaign.users, { userId });

    if (!campaignUser) {
      throw new Meteor.Error(401, "User not part of the campaign");
    }

    // Has a verified email
    if (!user.emails.find(e => e.verified == true)) {
      return false;
    }

    // Admin
    if (userId == campaign.creatorId) {
      return true;
    }

    const userPermissions = campaignUser.permissions;

    if (!userPermissions || !userPermissions[feature]) {
      return false;
    }

    // Any permission above "view" allows view
    if (
      PERMISSIONS[permission] == PERMISSIONS["view"] &&
      userPermissions[feature] >= PERMISSIONS["view"]
    ) {
      return true;
    }

    if (userPermissions[feature] & PERMISSIONS[permission]) {
      return true;
    }

    return false;
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
    this.unblock();

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
    party: {
      type: String
    },
    candidate: {
      type: String
    },
    office: {
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
  run({
    name,
    country,
    party,
    candidate,
    office,
    geolocation,
    facebookAccountId,
    invite
  }) {
    this.unblock();

    logger.debug("campaigns.create called", {
      name,
      country,
      party,
      office,
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
      if (!CampaignsHelpers.validateInvite({ invite })) {
        throw new Meteor.Error(401, "Campaign creation is currently disabled.");
      } else {
        hasInvite = true;
      }
    }

    if (FacebookAccounts.findOne({ facebookId: facebookAccountId })) {
      throw new Meteor.Error(
        401,
        "This account is already being used by another campaign"
      );
    }

    const users = [{ userId, status: "active" }];
    let insertDoc = {
      users,
      name,
      candidate,
      party,
      office,
      country,
      creatorId: userId
    };

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

export const campaignValidateInvite = new ValidatedMethod({
  name: "campaigns.validateInvite",
  validate: new SimpleSchema({
    invite: {
      type: String
    }
  }).validator(),
  run({ invite }) {
    this.unblock();
    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin", "moderator"]))
      return false;
    return CampaignsHelpers.validateInvite({ invite });
  }
});

export const campaignsSelectGet = new ValidatedMethod({
  name: "campaigns.selectGet",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("campaigns.selectGet called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let selector = { _id: campaignId };
    let options = {
      fields: {
        name: 1
      }
    };

    const campaign = Campaigns.findOne(selector, options);

    return campaign;
  }
});

export const campaignsSearch = new ValidatedMethod({
  name: "campaigns.search",
  validate: new SimpleSchema({
    search: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ search }) {
    this.unblock();
    logger.debug("campaigns.search called", { search });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let selector = {};
    let options = {
      limit: 30,
      sort: { createdAt: -1 },
      fields: {
        name: 1
      }
    };

    if (search) {
      selector.$text = { $search: search };
      options.fields.score = { $meta: "textScore" };
      options.sort = { score: { $meta: "textScore" } };
    }

    return Campaigns.find(selector, options).fetch();
  }
});

export const campaignsFormUpdate = new ValidatedMethod({
  name: "campaigns.formUpdate",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    slug: {
      type: String,
      optional: true,
      unique: true
    },
    crm: {
      type: Object,
      optional: true
    },
    "crm.language": {
      type: String,
      optional: true
    },
    "crm.header": {
      type: String,
      optional: true
    },
    "crm.text": {
      type: String,
      optional: true
    },
    "crm.thanks": {
      type: String,
      optional: true
    }
  }).validator(),
  run({ campaignId, ...data }) {
    logger.debug("campaigns.formUpdate called", {
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

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "form",
        permission: "edit"
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    let $set = {};

    if (data.slug) {
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
        data.slug.length < minimumLength ||
        reservedSlugs.indexOf(data.slug) !== -1
      ) {
        throw new Meteor.Error(400, "Form slug is not valid.");
      }
      if (
        Campaigns.find({
          "forms.slug": data.slug,
          _id: { $nin: [campaign._id] }
        }).fetch().length
      ) {
        throw new Meteor.Error(400, "Slug already in use");
      }
      $set["forms.slug"] = data.slug;
    } else {
      $set["forms.slug"] = "";
    }
    if (data.crm) {
      $set["forms.crm"] = data.crm;
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $set }
    );
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
    candidate: {
      type: String
    },
    party: {
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

    if (campaign.creatorId != userId) {
      throw new Meteor.Error(401, "Not allowed");
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $set: data }
    );
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

export const campaignInviteInfo = new ValidatedMethod({
  name: "campaigns.getInviteInfo",
  validate: new SimpleSchema({
    invite: {
      type: String
    }
  }).validator(),
  run({ invite }) {
    const parsedInvite = invite.split("|");
    if (parsedInvite[1]) {
      const campaign = CampaignsHelpers.getInviteCampaign({
        campaignId: parsedInvite[1],
        inviteId: parsedInvite[0]
      });
      if (campaign)
        return campaign.users.find(u => u.inviteId == parsedInvite[0]);
    }
    return false;
  }
});

export const campaignInviteData = new ValidatedMethod({
  name: "campaigns.perInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("campaign.perInvite", { campaignId });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    return Campaigns.findOne(
      {
        _id: campaignId,
        users: { $elemMatch: { userId, status: "pending" } }
      },
      {
        fields: {
          name: 1,
          office: 1,
          party: 1,
          candidate: 1
        }
      }
    );
  }
});

export const acceptInvite = new ValidatedMethod({
  name: "campaigns.acceptInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("campaigns.acceptInvite", { campaignId });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const currentUser = Meteor.users.findOne(userId);

    const campaign = Campaigns.findOne({
      _id: campaignId,
      users: { $elemMatch: { userId, status: "pending" } }
    });

    if (!campaign) {
      throw new Meteor.Error(404, "Not Found");
    }

    Campaigns.update(
      { _id: campaignId, "users.userId": userId },
      { $set: { "users.$.status": "active" } }
    );

    NotificationsHelpers.add({
      userId: campaign.creatorId,
      metadata: {
        name: currentUser.name,
        campaignName: campaign.name
      },
      category: "campaignInviteAccepted",
      dataRef: campaignId
    });

    NotificationsHelpers.clear({
      userId,
      dataRef: campaignId,
      category: "campaignInvite"
    });
  }
});

export const declineInvite = new ValidatedMethod({
  name: "campaigns.declineInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("campaigns.declineInvite", { campaignId });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const currentUser = Meteor.users.findOne(userId);

    const campaign = Campaigns.findOne({
      _id: campaignId,
      users: { $elemMatch: { userId, status: "pending" } }
    });

    if (!campaign) {
      throw new Meteor.Error(404, "Not Found");
    }

    const campaignUser = _.findWhere(campaign.users, { userId });

    if (!campaignUser) {
      return;
    }

    Campaigns.update(
      {
        _id: campaignId
      },
      { $pull: { users: campaignUser } }
    );

    NotificationsHelpers.add({
      userId: campaign.creatorId,
      metadata: {
        name: currentUser.name,
        campaignName: campaign.name
      },
      category: "campaignInviteDeclined",
      dataRef: campaignId
    });

    NotificationsHelpers.clear({
      userId,
      dataRef: campaignId,
      category: "campaignInvite"
    });
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
      type: String,
      optional: true
    },
    permissions: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, email, role, permissions }) {
    logger.debug("campaigns.addUser called", { campaignId, email, role });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const currentUser = Meteor.users.findOne(userId);

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

    let inviteId;
    if (!user) {
      if (_.findWhere(campaign.users, { email })) {
        throw new Meteor.Error(401, "User already invited.");
      }
      if (!mailer) {
        throw new Meteor.Error("Mailer not found, unable to invite user");
      }
      inviteId = Random.id();
      const url = Meteor.absoluteUrl(
        `/register?campaignInvite=${inviteId}|${campaign._id}`
      );
      // This should send email invite
      Campaigns.update(
        {
          _id: campaignId
        },
        { $push: { users: { inviteId, email, permissions, role } } }
      );
      sendMail({
        to: email,
        subject: "You've received a campaign invitation!",
        body: `
          <h3>You've been invited to be a part of ${campaign.name}</h3>
          <p>Access the link below to complete your registration:</p>
          <p>${url}</p>
        `
      });
    } else {
      if (_.findWhere(campaign.users, { userId: user._id })) {
        throw new Meteor.Error(401, "User already part of this campaign.");
      }

      Campaigns.update(
        {
          _id: campaignId
        },
        { $push: { users: { userId: user._id, permissions, role } } }
      );

      NotificationsHelpers.add({
        userId: user._id,
        metadata: {
          name: currentUser.name
        },
        path: `/campaign/invite?id=${campaignId}`,
        category: "campaignInvite",
        dataRef: campaignId,
        removable: false
      });
    }

    let logData = {
      permissions,
      role
    };
    if (user) {
      logData.userId = user._id;
    } else if (inviteId) {
      logData.inviteId = inviteId;
    }
    Meteor.call("log", {
      type: "campaigns.users.add",
      campaignId,
      data: logData
    });
  }
});

export const updateUser = new ValidatedMethod({
  name: "campaigns.updateUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    userId: {
      type: String,
      optional: true
    },
    inviteId: {
      type: String,
      optional: true
    },
    role: {
      type: String,
      optional: true
    },
    permissions: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, userId, inviteId, role, permissions }) {
    logger.debug("campaigns.updateUser called", {
      campaignId,
      userId,
      inviteId,
      role,
      permissions
    });

    if (!userId && !inviteId) {
      throw new Meteor.Error(400, "User ID or Invite ID required");
    }

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

    if (userId) {
      const campaignUser = _.findWhere(campaign.users, { userId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      if (userId == campaign.creatorId) {
        throw new Meteor.Error(401, "You can't change admin permissions");
      }
      Campaigns.update(
        {
          _id: campaignId,
          "users.userId": userId
        },
        { $set: { "users.$.role": role, "users.$.permissions": permissions } }
      );
      Meteor.call("log", {
        type: "campaigns.users.update",
        campaignId,
        data: { userId, role, permissions }
      });
    } else if (inviteId) {
      const campaignUser = _.findWhere(campaign.users, { inviteId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      Campaigns.update(
        {
          _id: campaignId,
          "users.inviteId": inviteId
        },
        { $set: { "users.$.role": role, "users.$.permissions": permissions } }
      );
      Meteor.call("log", {
        type: "campaigns.users.update",
        campaignId,
        data: { inviteId, role, permissions }
      });
    }
  }
});

export const removeUser = new ValidatedMethod({
  name: "campaigns.removeUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    userId: {
      type: String,
      optional: true
    },
    inviteId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ campaignId, userId, inviteId }) {
    logger.debug("campaigns.removeUser called", {
      campaignId,
      userId,
      inviteId
    });

    if (!userId && !inviteId) {
      throw new Meteor.Error(400, "User ID or Invite ID required");
    }

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

    if (userId) {
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
    } else if (inviteId) {
      const campaignUser = _.findWhere(campaign.users, { inviteId });
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
        data: { inviteId }
      });
    }
  }
});

export const applyInvitation = new ValidatedMethod({
  name: "campaigns.applyInvitation",
  validate: new SimpleSchema({
    invite: {
      type: String
    }
  }).validator(),
  run({ invite }) {
    const userId = Meteor.userId();
    logger.debug("campaigns.applyInvitation called", { invite, userId });

    if (!userId) {
      throw new Meteor.Error(400, "You must be logged in");
    }

    const user = Meteor.users.findOne(userId);

    const parsedInvite = invite.split("|");

    if (!parsedInvite[1]) throw new Meteor.Error(400, "Invalid invite");

    const campaignId = parsedInvite[1];
    const inviteId = parsedInvite[0];
    const campaign = CampaignsHelpers.getInviteCampaign({
      campaignId,
      inviteId
    });

    if (!campaign) {
      throw new Meteor.Error(404, "Not found");
    }
    const inviteData = campaign.users.find(u => u.inviteId == inviteId);
    let userSet = {};
    if (user.emails[0].address == inviteData.email) {
      userSet["emails.$.verified"] = true;
    }
    if (!user.type) {
      userSet["type"] = "user";
    }

    CampaignsHelpers.applyInvitation({ campaignId, inviteId, userId });

    if (Object.keys(userSet).length) {
      Meteor.users.update(
        { _id: userId, "emails.address": user.emails[0].address },
        { $set: userSet }
      );
    }

    // Notify campaign owner
    NotificationsHelpers.add({
      userId: campaign.creatorId,
      metadata: {
        name: user.name,
        campaignName: campaign.name
      },
      category: "campaignInviteAccepted",
      dataRef: campaignId
    });

    return { campaignId };
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
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
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
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
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
