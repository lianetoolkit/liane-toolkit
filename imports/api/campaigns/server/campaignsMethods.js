import SimpleSchema from "simpl-schema";
import { Random } from "meteor/random";
import { sendMail } from "/imports/emails/server/mailer";
import { Campaigns, Invites } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "./campaignsHelpers.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { GeolocationsHelpers } from "/imports/api/geolocations/server/geolocationsHelpers.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;
import { Geolocations } from "/imports/api/geolocations/geolocations";
import { Notifications } from "/imports/api/notifications/notifications";
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";
import _ from "underscore";
import Papa from "papaparse";
import { flattenObject } from "/imports/utils/common.js";

import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";

import MarkdownIt from "markdown-it";
import createEmail from "/imports/emails/server/createEmail";

const markdown = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
});

import {
  FEATURES,
  PERMISSIONS,
  FEATURE_PERMISSION_MAP,
} from "/imports/utils/campaignPermissions";

const PRIVATE = Meteor.settings.private;

export const canManageCampaign = new ValidatedMethod({
  name: "campaigns.isUserTeam",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    userId: {
      type: String,
    },
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
  },
});

export const userCan = new ValidatedMethod({
  name: "campaigns.userCan",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    userId: {
      type: String,
    },
    feature: {
      type: String,
    },
    permission: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ campaignId, userId, feature, permission }) {
    this.unblock();

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
    if (!user.emails.find((e) => e.verified == true)) {
      return false;
    }

    // Admin
    if (campaignUser.role) {
      if (campaignUser.role == "admin") {
        return true;
      }
    } else if (userId == campaign.creatorId) {
      return true;
    }

    if (feature == "admin") return false;

    // Only "admin" feature doesnt require "permission" param
    if (!permission || !PERMISSIONS[permission])
      throw new Meteor.Error(404, "Permission not found");

    if (!_.find(FEATURES, (f) => f == feature))
      throw new Meteor.Error(404, "Feature not found");

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
  },
});

export const campaignHasAccount = new ValidatedMethod({
  name: "campaigns.hasAccount",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
  }).validator(),
  run({ campaignId, facebookId }) {
    this.unblock();

    const campaign = Campaigns.findOne(campaignId);
    return (
      (campaign.facebookAccount &&
        campaign.facebookAccount.facebookId == facebookId) ||
      !!_.findWhere(campaign.accounts, { facebookId })
    );
  },
});

export const campaignsCreate = new ValidatedMethod({
  name: "campaigns.create",
  validate: new SimpleSchema({
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    party: {
      type: String,
      optional: true,
    },
    candidate: {
      type: String,
      optional: true,
    },
    office: {
      type: String,
      optional: true,
    },
    cause: {
      type: String,
      optional: true,
    },
    contact: {
      type: Object,
    },
    "contact.email": {
      type: String,
    },
    "contact.phone": {
      type: String,
      optional: true,
    },
    country: {
      type: String,
    },
    geolocation: {
      type: Object,
      optional: true,
    },
    "geolocation.osm_id": {
      type: Number,
    },
    "geolocation.osm_type": {
      type: String,
    },
    "geolocation.type": {
      type: String,
      allowedValues: ["state", "city"],
    },
    facebookAccountId: {
      type: String,
    },
    invite: {
      type: String,
      optional: true,
    },
    details: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({
    name,
    type,
    country,
    party,
    candidate,
    office,
    cause,
    contact,
    geolocation,
    facebookAccountId,
    invite,
    details,
  }) {
    this.unblock();

    logger.debug("campaigns.create called", {
      name,
      type,
      country,
      geolocation,
      facebookAccountId,
      invite,
      details,
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

    const users = [{ userId, status: "active", role: "admin" }];
    let insertDoc = {
      users,
      name,
      type,
      contact,
      country,
      details,
      creatorId: userId,
    };

    if (type.match(/electoral|mandate/)) {
      if (!party) throw new Meteor.Error(400, "You must define a party");
      if (!candidate)
        throw new Meteor.Error(400, "You must define a candidacy name");
      if (!office)
        throw new Meteor.Error(400, "You must define an office position");
      insertDoc.party = party;
      insertDoc.candidate = candidate;
      insertDoc.office = office;
    }

    if (type.match(/mobilization/)) {
      if (!cause) throw new Meteor.Error(400, "You must define a cause");
      insertDoc.cause = cause;
    }

    const user = Meteor.users.findOne(userId);
    const token = user.services.facebook.accessToken;

    let geolocationId = false;
    if (!geolocation) {
      const nominatinRes = GeolocationsHelpers.nominatimSearch({ country });
      geolocation = {
        type: "country",
        osm_id: nominatinRes[0].osm_id,
        osm_type: nominatinRes[0].osm_type,
      };
    }
    try {
      geolocationId = GeolocationsHelpers.discoverAndStore({
        ...geolocation,
        accessToken: token,
      });
    } catch (e) {
      throw new Meteor.Error(500, "Unexpected error, please try again");
    }

    if (geolocationId) {
      insertDoc.geolocationId = geolocationId;
    }

    const account = FacebookAccountsHelpers.getUserAccount({
      userId,
      facebookAccountId,
    });

    const accountToken = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token,
    });

    insertDoc.facebookAccount = {
      userFacebookId: user.services.facebook.id,
      facebookId: account.id,
      accessToken: accountToken.result,
    };

    campaignId = Campaigns.insert(insertDoc);

    CampaignsHelpers.setMainAccount({ user, campaignId, account });

    if (hasInvite) {
      Invites.update(
        { key: invite },
        {
          $set: { used: true, usedBy: userId },
        }
      );
    }

    const geolocationData = Geolocations.findOne(geolocationId);
    const creatorData = Meteor.users.findOne(userId);
    Meteor.call("log", {
      type: "campaigns.add",
      campaignId,
      data: {
        name,
        type,
        geolocationId,
        candidate,
        party,
        office,
        cause,
        country,
        details,
        userName: creatorData.name,
        geolocationName: geolocationData.name,
        geolocationType: geolocationData.regionType,
        accountId: account.id,
        accountName: account.name,
        invite: hasInvite ? invite : false,
      },
    });

    return { result: campaignId };
  },
});

export const campaignValidateInvite = new ValidatedMethod({
  name: "campaigns.validateInvite",
  validate: new SimpleSchema({
    invite: {
      type: String,
    },
  }).validator(),
  run({ invite }) {
    this.unblock();
    const userId = Meteor.userId();
    if (userId && Roles.userIsInRole(userId, ["admin", "moderator"]))
      return false;
    return CampaignsHelpers.validateInvite({ invite });
  },
});

export const campaignsSelectGet = new ValidatedMethod({
  name: "campaigns.selectGet",
  validate: new SimpleSchema({
    campaignIds: {
      type: Array,
    },
    "campaignIds.$": {
      type: String,
    },
  }).validator(),
  run({ campaignIds }) {
    this.unblock();
    logger.debug("campaigns.selectGet called", { campaignIds });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let selector = { _id: { $in: campaignIds } };
    let options = {
      fields: {
        name: 1,
      },
    };

    const campaign = Campaigns.findOne(selector, options);

    return campaign;
  },
});

export const campaignsSearch = new ValidatedMethod({
  name: "campaigns.search",
  validate: new SimpleSchema({
    search: {
      type: String,
      optional: true,
    },
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
        name: 1,
      },
    };

    if (search) {
      selector.$text = { $search: search };
      options.fields.score = { $meta: "textScore" };
      options.sort = { score: { $meta: "textScore" } };
    }

    return Campaigns.find(selector, options).fetch();
  },
});

export const campaignsExport = new ValidatedMethod({
  name: "campaigns.export",
  validate() {},
  run() {
    logger.debug("campaigns.export called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const processCampaign = (campaign) => {
      if (campaign.details) {
        for (const key in campaign.details) {
          campaign[key] = campaign.details[key];
        }
      }
      if (campaign.contact) {
        campaign.email = campaign.contact.email;
        campaign.phone = campaign.contact.phone;
      }
      if (campaign.users) {
        campaign.users = campaign.users.map((user) => user.userId).join(", ");
      }

      // Cleanup
      delete campaign.forms;
      delete campaign.contact;
      delete campaign.details;
      delete campaign.facebookAccount;
      delete campaign.creatorId;
      delete campaign.geolocationId;

      return campaign;
    };

    const campaigns = Campaigns.find().fetch();

    const flattened = [];
    const headersMap = {};
    for (const campaign of campaigns) {
      const flattenedCampaign = flattenObject(processCampaign(campaign));
      for (const header in flattenedCampaign) {
        headersMap[header] = true;
      }
      flattened.push(flattenedCampaign);
    }

    return Papa.unparse({ fields: Object.keys(headersMap), data: flattened });
  },
});

export const campaignsFormUpdate = new ValidatedMethod({
  name: "campaigns.formUpdate",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    slug: {
      type: String,
      optional: true,
      unique: true,
    },
    crm: {
      type: Object,
      optional: true,
    },
    "crm.language": {
      type: String,
      optional: true,
    },
    "crm.header": {
      type: String,
      optional: true,
    },
    "crm.text": {
      type: String,
      optional: true,
    },
    "crm.thanks": {
      type: String,
      optional: true,
    },
    "crm.donation": {
      type: String,
      optional: true,
    },
    "crm.redirect": {
      type: String,
      optional: true,
    },
    skills: {
      type: Array,
      optional: true,
    },
    "skills.$": {
      type: Object,
    },
    "skills.$.label": {
      type: String,
    },
    "skills.$.value": {
      type: String,
    },
    "skills.$.active": {
      type: Boolean,
    },
  }).validator(),
  run({ campaignId, ...data }) {
    logger.debug("campaigns.formUpdate called", {
      campaignId,
      data,
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
        permission: "edit",
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
        "support",
        "transparency",
        "form_settings",
        "faq",
        "comments",
        "account",
        "messages",
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
          _id: { $nin: [campaign._id] },
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

    if (data.skills) {
      $set["forms.skills"] = data.skills;
    }

    Campaigns.update(
      {
        _id: campaignId,
      },
      { $set }
    );

    Meteor.call("log", {
      type: "campaigns.formUpdate",
      campaignId,
      data,
    });
  },
});

export const campaignsUpdate = new ValidatedMethod({
  name: "campaigns.update",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    name: {
      type: String,
      optional: true,
    },
    candidate: {
      type: String,
      optional: true,
    },
    party: {
      type: String,
      optional: true,
    },
    cause: {
      type: String,
      optional: true,
    },
    country: {
      type: String,
      optional: true,
    },
    geolocation: {
      type: Object,
      optional: true,
    },
    "geolocation.osm_id": {
      type: Number,
    },
    "geolocation.osm_type": {
      type: String,
    },
    "geolocation.type": {
      type: String,
      allowedValues: ["state", "city"],
    },
    contact: {
      type: Campaigns.contactSchema,
    },
  }).validator(),
  run({ campaignId, ...data }) {
    logger.debug("campaigns.update called", {
      campaignId,
      data,
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
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    if (!data.name) {
      throw new Meteor.Error(400, "You must have a name");
    }

    const $set = {
      name: data.name,
    };

    if (campaign.type.match(/electoral|mandate/)) {
      if (!data.candidate) {
        throw new Meteor.Error(400, "You must have a candidacy name");
      }
      if (!data.party) {
        throw new Meteor.Error(400, "You must have a party");
      }
      $set.candidate = data.candidate;
      $set.party = data.party;
    }

    if (campaign.type.match(/mobilization/)) {
      if (!data.cause) {
        throw new Meteor.Error(400, "You must have a cause");
      }
      $set.cause = data.cause;
    }

    if (data.contact) {
      $set["contact"] = data.contact;
    }

    if (data.country && data.geolocation) {
      const user = Meteor.users.findOne(userId);
      const token = user.services.facebook.accessToken;
      let geolocationId = false;
      try {
        geolocationId = GeolocationsHelpers.discoverAndStore({
          ...data.geolocation,
          accessToken: token,
        });
      } catch (e) {
        console.log(e);
        throw new Meteor.Error(500, "Unexpected error, please try again");
      }

      if (geolocationId) {
        $set["country"] = data.country;
        $set["geolocationId"] = geolocationId;
      }
    }

    Campaigns.update(
      {
        _id: campaignId,
      },
      { $set }
    );
    Meteor.call("log", {
      type: "campaigns.update",
      campaignId,
      data,
    });
  },
});

export const campaignsRemove = new ValidatedMethod({
  name: "campaigns.remove",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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
      Roles.userIsInRole(userId, ["admin"]) ||
      Meteor.call("campaigns.userCan", {
        userId,
        campaignId: campaign._id,
        feature: "admin",
      });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const res = CampaignsHelpers.removeCampaign({ campaignId });

    Meteor.call("log", {
      type: "campaigns.remove",
      campaignId,
    });

    return res;
  },
});

export const campaignsSuspend = new ValidatedMethod({
  name: "campaigns.suspend",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    suspend: {
      type: Boolean,
    },
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

    let logType;
    if (suspend) {
      logType = "suspended";
      CampaignsHelpers.suspendCampaign({ campaignId });
    } else {
      logType = "activated";
      CampaignsHelpers.activateCampaign({ campaignId });
    }
    Meteor.call("log", {
      type: `campaigns.${logType}`,
      campaignId,
    });
  },
});

export const campaignsRefreshAllJobs = new ValidatedMethod({
  name: "campaigns.refreshAllJobs",
  validate: new SimpleSchema({
    type: {
      type: String,
      optional: true,
    },
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
  },
});

export const campaignRefreshHealthCheck = new ValidatedMethod({
  name: "campaigns.refreshHealthCheck",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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

    if (
      !(
        Roles.userIsInRole(userId, ["admin"]) ||
        Meteor.call("campaigns.userCan", {
          campaignId,
          userId,
          feature: "admin",
        })
      )
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return CampaignsHelpers.refreshHealthCheck({ campaignId });
  },
});

export const campaignUpdateFacebook = new ValidatedMethod({
  name: "campaigns.updateFacebook",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    token: {
      type: String,
    },
    secret: {
      type: String,
    },
  }).validator(),
  run({ campaignId, token, secret }) {
    logger.debug("campaigns.updateFacebook called", { campaignId });

    const userId = Meteor.userId();

    if (!campaignId) {
      throw new Meteor.Error(401, "Campaign ID not found");
    }
    const campaign = Campaigns.findOne(campaignId);

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const account = FacebookAccountsHelpers.getUserAccount({
      userId,
      facebookAccountId: campaign.facebookAccount.facebookId,
    });

    const accountToken = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token,
    });

    const user = Meteor.users.findOne(userId);

    Campaigns.update(campaignId, {
      $set: {
        "facebookAccount.accessToken": accountToken.result,
        "facebookAccount.userFacebookId": user.services.facebook.id,
      },
    });

    FacebookAccountsHelpers.updateInstagramBusinessAccountId({
      facebookId: campaign.facebookAccount.facebookId,
      token: accountToken.result,
    });

    FacebookAccountsHelpers.updateFBSubscription({
      facebookAccountId: campaign.facebookAccount.facebookId,
      token: accountToken.result,
    });

    CampaignsHelpers.refreshCampaignJobs({ campaignId });

    Meteor.call("log", {
      type: "campaigns.facebook.token.update",
      campaignId,
    });

    const updatedCampaign = Campaigns.findOne(campaignId);

    return {
      ...updatedCampaign.facebookAccount,
      ...FacebookAccounts.findOne({
        facebookId: campaign.facebookAccount.facebookId,
      }),
    };
  },
});

export const campaignUpdateInstagram = new ValidatedMethod({
  name: "campaigns.updateInstagram",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    logger.debug("campaigns.updateFacebook called", { campaignId });

    const userId = Meteor.userId();

    if (!campaignId) {
      throw new Meteor.Error(401, "Campaign ID not found");
    }
    const campaign = Campaigns.findOne(campaignId);

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    FacebookAccountsHelpers.updateInstagramBusinessAccountId({
      facebookId: campaign.facebookAccount.facebookId,
      token: campaign.facebookAccount.accessToken,
    });

    FacebookAccountsHelpers.updateFBSubscription({
      facebookAccountId: campaign.facebookAccount.facebookId,
      token: campaign.facebookAccount.accessToken,
    });
  },
});

export const campaignInviteInfo = new ValidatedMethod({
  name: "campaigns.getInviteInfo",
  validate: new SimpleSchema({
    invite: {
      type: String,
    },
  }).validator(),
  run({ invite }) {
    const parsedInvite = invite.split("|");
    if (parsedInvite[1]) {
      const campaign = CampaignsHelpers.getInviteCampaign({
        campaignId: parsedInvite[1],
        inviteId: parsedInvite[0],
      });
      if (campaign)
        return campaign.users.find((u) => u.inviteId == parsedInvite[0]);
    }
    return false;
  },
});

export const campaignInviteData = new ValidatedMethod({
  name: "campaigns.perInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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
        users: { $elemMatch: { userId, status: "pending" } },
      },
      {
        fields: {
          name: 1,
          type: 1,
          office: 1,
          party: 1,
          candidate: 1,
          cause: 1,
        },
      }
    );
  },
});

export const acceptInvite = new ValidatedMethod({
  name: "campaigns.acceptInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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
      users: { $elemMatch: { userId, status: "pending" } },
    });

    if (!campaign) {
      throw new Meteor.Error(404, "Not Found");
    }

    Campaigns.update(
      { _id: campaignId, "users.userId": userId },
      { $set: { "users.$.status": "active" } }
    );

    CampaignsHelpers.getAdmins({ campaignId }).map((admin) => {
      NotificationsHelpers.add({
        userId: admin.userId,
        metadata: {
          name: currentUser.name,
          campaignName: campaign.name,
        },
        category: "campaignInviteAccepted",
        dataRef: campaignId,
      });
    });

    NotificationsHelpers.clear({
      userId,
      dataRef: campaignId,
      category: "campaignInvite",
    });

    Meteor.call("log", {
      type: "campaigns.users.invite.accepted",
      campaignId,
      data: {
        name: currentUser.name,
      },
    });
  },
});

export const declineInvite = new ValidatedMethod({
  name: "campaigns.declineInvite",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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
      users: { $elemMatch: { userId, status: "pending" } },
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
        _id: campaignId,
      },
      { $pull: { users: campaignUser } }
    );

    CampaignsHelpers.getAdmins({ campaignId }).map((admin) => {
      NotificationsHelpers.add({
        userId: admin.userId,
        metadata: {
          name: currentUser.name,
          campaignName: campaign.name,
        },
        category: "campaignInviteDeclined",
        dataRef: campaignId,
      });
    });

    NotificationsHelpers.clear({
      userId,
      dataRef: campaignId,
      category: "campaignInvite",
    });

    Meteor.call("log", {
      type: "campaigns.users.invite.declined",
      campaignId,
    });
  },
});

export const addUser = new ValidatedMethod({
  name: "campaigns.addUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    email: {
      type: String,
    },
    role: {
      type: String,
      optional: true,
    },
    permissions: {
      type: Object,
      optional: true,
      blackbox: true,
    },
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

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (role != "admin" && (!permissions || !Object.keys(permissions).length)) {
      throw new Meteor.Error(400, "Missing permissions");
    }

    const user = Meteor.users.findOne({
      emails: { $elemMatch: { address: email } },
    });

    let inviteId;
    if (!user) {
      if (_.findWhere(campaign.users, { email })) {
        throw new Meteor.Error(401, "User already invited.");
      }
      inviteId = Random.id();
      const url = Meteor.absoluteUrl(
        `/register?campaignInvite=${inviteId}|${campaign._id}`
      );
      // This should send email invite
      Campaigns.update(
        {
          _id: campaignId,
        },
        { $push: { users: { inviteId, email, permissions, role } } }
      );
      sendMail({
        type: "campaignInvitation",
        language: currentUser.userLanguage || "en",
        recipient: email,
        data: {
          name: currentUser.name,
          campaignName: campaign.name,
          url,
          role,
        },
      });
    } else {
      if (_.findWhere(campaign.users, { userId: user._id })) {
        throw new Meteor.Error(401, "User already part of this campaign.");
      }

      Campaigns.update(
        {
          _id: campaignId,
        },
        { $push: { users: { userId: user._id, permissions, role } } }
      );

      NotificationsHelpers.add({
        userId: user._id,
        metadata: {
          name: currentUser.name,
        },
        path: `/campaign/invite?id=${campaignId}`,
        category: "campaignInvite",
        dataRef: campaignId,
        removable: false,
      });
    }

    let logData = {
      permissions,
      role,
    };
    if (user) {
      logData.userId = user._id;
    } else if (inviteId) {
      logData.inviteId = inviteId;
    }
    Meteor.call("log", {
      type: "campaigns.users.add",
      campaignId,
      data: logData,
    });
  },
});

export const updateUser = new ValidatedMethod({
  name: "campaigns.updateUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    userId: {
      type: String,
      optional: true,
    },
    inviteId: {
      type: String,
      optional: true,
    },
    role: {
      type: String,
      optional: true,
    },
    permissions: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, userId, inviteId, role, permissions }) {
    logger.debug("campaigns.updateUser called", {
      campaignId,
      userId,
      inviteId,
      role,
      permissions,
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
      !Meteor.call("campaigns.userCan", {
        userId: currentUser,
        campaignId,
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (userId) {
      const campaignUser = _.findWhere(campaign.users, { userId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      if (
        CampaignsHelpers.getAdminCount({ campaignId }) == 1 &&
        Meteor.call("campaigns.userCan", {
          userId,
          campaignId,
          feature: "admin",
        })
      ) {
        throw new Meteor.Error(
          401,
          "Can't update permissions, you are the only admin!"
        );
      }
      Campaigns.update(
        {
          _id: campaignId,
          "users.userId": userId,
        },
        { $set: { "users.$.role": role, "users.$.permissions": permissions } }
      );
      Meteor.call("log", {
        type: "campaigns.users.update",
        campaignId,
        data: { userId, role, permissions },
      });
    } else if (inviteId) {
      const campaignUser = _.findWhere(campaign.users, { inviteId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      Campaigns.update(
        {
          _id: campaignId,
          "users.inviteId": inviteId,
        },
        { $set: { "users.$.role": role, "users.$.permissions": permissions } }
      );
      Meteor.call("log", {
        type: "campaigns.users.update",
        campaignId,
        data: { inviteId, role, permissions },
      });
    }
  },
});

export const removeUser = new ValidatedMethod({
  name: "campaigns.removeUser",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    userId: {
      type: String,
      optional: true,
    },
    inviteId: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ campaignId, userId, inviteId }) {
    logger.debug("campaigns.removeUser called", {
      campaignId,
      userId,
      inviteId,
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
      !Meteor.call("campaigns.userCan", {
        userId: currentUser,
        campaignId,
        feature: "admin",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (currentUser == userId) {
      throw new Meteor.Error(401, "You can't remove yourself");
    }

    if (
      userId &&
      Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "admin",
      }) &&
      CampaignsHelpers.getAdminCount({ campaignId }) == 1
    ) {
      throw new Meteor.Error(401, "You can't remove the only admin");
    }

    if (userId) {
      const campaignUser = _.findWhere(campaign.users, { userId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      Campaigns.update(
        {
          _id: campaignId,
        },
        { $pull: { users: campaignUser } }
      );
      Notifications.remove({ userId, dataRef: campaignId });
      Meteor.call("log", {
        type: "campaigns.users.remove",
        campaignId,
        data: { userId },
      });
    } else if (inviteId) {
      const campaignUser = _.findWhere(campaign.users, { inviteId });
      if (!campaignUser) {
        throw new Meteor.Error(401, "User is not part of this campaign.");
      }
      Campaigns.update(
        {
          _id: campaignId,
        },
        { $pull: { users: campaignUser } }
      );
      Meteor.call("log", {
        type: "campaigns.users.remove",
        campaignId,
        data: { inviteId },
      });
    }
  },
});

export const applyInvitation = new ValidatedMethod({
  name: "campaigns.applyInvitation",
  validate: new SimpleSchema({
    invite: {
      type: String,
    },
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
      inviteId,
    });

    if (!campaign) {
      throw new Meteor.Error(404, "Not found");
    }
    const inviteData = campaign.users.find((u) => u.inviteId == inviteId);
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

    // Notify campaign admins
    CampaignsHelpers.getAdmins({ campaignId }).map((admin) => {
      NotificationsHelpers.add({
        userId: admin.userId,
        metadata: {
          name: user.name,
          campaignName: campaign.name,
        },
        category: "campaignInviteAccepted",
        dataRef: campaignId,
      });
    });

    Meteor.call("log", {
      type: "campaigns.users.invite.accepted",
      campaignId,
      data: {
        name: user.name,
      },
    });

    return { campaignId };
  },
});

export const refreshAccountJob = new ValidatedMethod({
  name: "campaigns.refreshAccountJob",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    facebookAccountId: {
      type: String,
    },
    type: {
      type: String,
    },
  }).validator(),
  run({ campaignId, facebookAccountId, type }) {
    this.unblock();
    logger.debug("campaigns.refreshAccountJob", {
      campaignId,
      facebookAccountId,
      type,
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
  },
});

export const campaignCounts = new ValidatedMethod({
  name: "campaigns.counts",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
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

    if (
      !Meteor.call("campaigns.isUserTeam", {
        userId,
        campaignId,
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (!campaign.facebookAccount) {
      throw new Meteor.Error(400, "Facebook Account not found");
    }

    const account = FacebookAccounts.findOne({
      facebookId: campaign.facebookAccount.facebookId,
    });

    if (!account) {
      throw new Meteor.Error(400, "Facebook Account not found");
    }

    let counts = {};

    counts["people"] = People.find({ campaignId }).count();
    counts["comments"] = Comments.find({
      facebookAccountId: account.facebookId,
    }).count();
    counts["likes"] = Likes.find({
      facebookAccountId: account.facebookId,
      parentId: { $exists: false },
    }).count();

    return counts;
  },
});

export const campaignQueryCount = new ValidatedMethod({
  name: "campaigns.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ query }) {
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
    return Campaigns.find(query || {}).count();
  },
});

export const inviteQueryCount = new ValidatedMethod({
  name: "invites.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ query }) {
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
    return Invites.find(query || {}).count();
  },
});

export const inviteUnsentCount = new ValidatedMethod({
  name: "invites.unsentCount",
  validate() {},
  run() {
    logger.debug("invites.unsentCount called");

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    return Invites.find({
      name: { $exists: true },
      email: { $exists: true },
      sent: { $ne: true },
    }).count();
  },
});

export const createInvite = new ValidatedMethod({
  name: "invites.new",
  validate: new SimpleSchema({
    name: {
      type: String,
      optional: true,
    },
    email: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ name, email }) {
    this.unblock();
    logger.debug("invites.new called", { name, email });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    if (email && !validateEmail(email)) {
      throw new Meteor.Error(400, "Invalid email");
    }

    const insertDoc = {};

    if (name) insertDoc.name = name;
    if (email) insertDoc.email = email;

    return Invites.insert(insertDoc);
  },
});

const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const designateInvite = new ValidatedMethod({
  name: "invites.designate",
  validate: new SimpleSchema({
    inviteId: {
      type: String,
    },
    name: {
      type: String,
      optional: true,
    },
    email: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ inviteId, name, email }) {
    this.unblock();
    logger.debug("invites.designate called", { inviteId });

    if (email && !validateEmail(email)) {
      throw new Meteor.Error(400, "Invalid email");
    }

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    const invite = Invites.findOne(inviteId);

    if (!invite) {
      throw new Meteor.Error(404, "Invite not found");
    }

    Invites.update(inviteId, { $set: { name, email } });

    return;
  },
});

export const removeInvite = new ValidatedMethod({
  name: "invites.remove",
  validate: new SimpleSchema({
    inviteId: {
      type: String,
    },
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
  },
});

export const emailInvite = new ValidatedMethod({
  name: "invites.emailInvite",
  validate: new SimpleSchema({
    inviteId: {
      type: String,
    },
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    language: {
      type: String,
    },
  }).validator(),
  run({ inviteId, title, message, language }) {
    logger.debug("invites.emailInvite called", { inviteId });

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    if (!title) throw new Meteor.Error(400, "You must define a title");
    if (!message) throw new Meteor.Error(400, "You must define a message");
    if (!language) throw new Meteor.Error(400, "You must select a language");

    const invite = Invites.findOne(inviteId);

    if (!invite) {
      throw new Meteor.Error(404, "Invite not found");
    }

    const email = createEmail(
      "default",
      language,
      { title, content: markdown.render(message) },
      title
    );
    const url = Meteor.absoluteUrl() + "?invite=" + invite.key;
    email.body = email.body.replace("%NAME%", invite.name);
    email.body = email.body.replace(
      "{link}",
      `<a href="${url}" rel="external" target="_blank">${url}</a>`
    );
    sendMail({
      subject: title,
      body: email.body,
      recipient: `"${invite.name}" <${invite.email}>`,
    });

    Invites.update(invite._id, { $set: { sent: true } });
  },
});

export const emailPending = new ValidatedMethod({
  name: "invites.emailPending",
  validate: new SimpleSchema({
    title: {
      type: String,
    },
    message: {
      type: String,
    },
    language: {
      type: String,
    },
  }).validator(),
  run({ title, message, language }) {
    logger.debug("invites.emailPending called");

    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }

    if (!title) throw new Meteor.Error(400, "You must define a title");
    if (!message) throw new Meteor.Error(400, "You must define a message");
    if (!language) throw new Meteor.Error(400, "You must select a language");

    const invites = Invites.find({
      name: { $exists: true },
      email: { $exists: true },
      sent: { $ne: true },
    });

    if (invites.count()) {
      const template = createEmail(
        "default",
        language,
        { title, content: markdown.render(message) },
        title
      );
      invites.forEach((invite) => {
        const email = { ...template };
        const url = Meteor.absoluteUrl() + "?invite=" + invite.key;
        email.body = email.body.replace("%NAME%", invite.name);
        email.body = email.body.replace(
          "{link}",
          `<a href="${url}" rel="external" target="_blank">${url}</a>`
        );
        sendMail({
          subject: title,
          body: email.body,
          recipient: `"${invite.name}" <${invite.email}>`,
        });
        Invites.update(invite._id, { $set: { sent: true } });
      });
    }
  },
});
