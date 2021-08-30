import SimpleSchema from "simpl-schema";
import { UsersHelpers } from "./usersHelpers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { difference } from "lodash";
import axios from "axios";
import nodemailer from "nodemailer";
import Papa from "papaparse";
import { flattenObject } from "/imports/utils/common.js";
DDPRateLimiter = require("meteor/ddp-rate-limiter").DDPRateLimiter;

let mailTransporter, mailConfig;
if (Meteor.settings.email && Meteor.settings.email.mail) {
  mailConfig = Meteor.settings.email.mail;
  mailTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.username,
      pass: mailConfig.password,
    },
  });
}

const PRIVATE = Meteor.settings.private;

export const isAppPrivate = new ValidatedMethod({
  name: "users.isAppPrivate",
  validate() {},
  run() {
    return {
      isPrivate: !!PRIVATE,
      hasMail: Meteor.settings.email && Meteor.settings.email.mail,
    };
  },
});

const verificationEmailRule = {
  userId(userId) {
    const user = Meteor.users.findOne(userId);
    return user && !(user.roles && user.roles.indexOf("admin") == -1);
  },
  type: "method",
  name: "users.sendVerificationEmail",
};

DDPRateLimiter.addRule(verificationEmailRule, 1, 20 * 1000);

export const sendVerificationEmail = new ValidatedMethod({
  name: "users.sendVerificationEmail",
  validate() {},
  run() {
    const userId = Meteor.userId();
    logger.debug("users.sendVerificationEmail called", { userId });
    if (!userId) {
      throw new Meteor.Error(401, "You are not logged in");
    }
    Accounts.sendVerificationEmail(userId);
  },
});

const updateEmailRule = {
  userId(userId) {
    const user = Meteor.users.findOne(userId);
    return user && !(user.roles && user.roles.indexOf("admin") == -1);
  },
  type: "method",
  name: "users.updateEmail",
};

DDPRateLimiter.addRule(updateEmailRule, 1, 20 * 1000);

export const updateEmail = new ValidatedMethod({
  name: "users.updateEmail",
  validate: new SimpleSchema({
    email: {
      type: String,
    },
  }).validator(),
  run({ email }) {
    const userId = Meteor.userId();
    logger.debug("users.updateEmail called", { userId });
    if (!userId) {
      throw new Meteor.Error(401, "You are not logged in");
    }
    const user = Meteor.users.findOne(userId);
    let oldEmail;
    if (user.emails.length) {
      oldEmail = user.emails[0].address;
    }
    if (oldEmail != email) Accounts.addEmail(userId, email);
    Accounts.sendVerificationEmail(userId);
    if (oldEmail && oldEmail != email) Accounts.removeEmail(userId, oldEmail);
  },
});

export const mailSubscribe = new ValidatedMethod({
  name: "users.mailSubscribe",
  validate: new SimpleSchema({
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    country: {
      type: String,
    },
  }).validator(),
  run({ name, email, country }) {
    logger.debug("users.mailSubscribe called", { name, email });
    if (!name || !email) {
      throw new Meteor.Error(400, "You must provide name and email");
    }
    if (mailTransporter) {
      mailTransporter.sendMail({
        from: `"Liane" <${mailConfig.username}>`,
        to: `${Meteor.settings.email.admins.join(", ")}`,
        subject: `[New Subscription] ${name}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Country:</strong> ${country}</p>`,
      });
    } else {
      throw new Meteor.Error(500, "Mailing not configured");
    }
    return;
  },
});

export const setLanguage = new ValidatedMethod({
  name: "users.setLanguage",
  validate: new SimpleSchema({
    language: {
      type: String,
    },
  }).validator(),
  run({ language }) {
    const userId = Meteor.userId();
    logger.debug("users.setLanguage called", { userId, language });

    if (!userId) {
      throw new Meteor.Error(401, "You are not logged in");
    }

    return Meteor.users.update(userId, { $set: { userLanguage: language } });
  },
});

export const updateProfile = new ValidatedMethod({
  name: "users.updateProfile",
  validate: new SimpleSchema({
    name: {
      type: String,
      optional: true,
    },
    country: {
      type: String,
      optional: true,
    },
    region: {
      type: String,
      optional: true,
    },
    phone: {
      type: String,
      optional: true,
    },
    campaignRole: {
      type: String,
      optional: true,
    },
    ref: {
      type: String,
      optional: true,
    },
  }).validator(),
  run(data) {
    const userId = Meteor.userId();
    logger.debug("users.updateProfile called", data);

    if (!userId) {
      throw new Meteor.Error(401, "You are not logged in");
    }

    return Meteor.users.update(userId, { $set: data });
  },
});

export const getCountry = new ValidatedMethod({
  name: "users.getCountry",
  validate() {},
  run() {
    const ip = this.connection.clientAddress;
    logger.debug("users.getCountry called", { ip });
    let res;
    const localIpRegexp = new RegExp(
      /(^127\.)|(^192\.168\.)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^::1$)|(^[fF][cCdD])/
    );
    if (!localIpRegexp.test(ip)) {
      try {
        res = Promise.await(
          axios.get(`https://get.geojs.io/v1/country/${ip}.json`)
        );
      } catch (err) {
        console.log(err);
      }
      if (res && res.data && res.data.country) {
        return res.data.country;
      }
    }

    return false;
  },
});

export const updateUser = new ValidatedMethod({
  name: "users.update",
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    name: {
      type: String,
    },
    roles: {
      type: Array,
    },
    "roles.$": {
      type: String,
    },
  }).validator(),
  run({ _id, name, roles }) {
    logger.debug("users.update called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    Meteor.users.upsert(
      { _id },
      {
        $set: {
          name,
          roles,
        },
      }
    );
    return;
  },
});

const validatePermissions = (scopes) => {
  const permissions = [
    "public_profile",
    "email",
    "pages_read_engagement",
    "pages_read_user_content",
    "pages_manage_posts",
    "pages_manage_engagement",
    "pages_manage_metadata",
    "pages_show_list",
    "pages_messaging",
    "instagram_basic",
    "instagram_manage_comments",
  ];
  return !difference(permissions, scopes || []).length;
};

export const validateFBToken = new ValidatedMethod({
  name: "users.validateToken",
  validate: new SimpleSchema({
    token: {
      type: String,
    },
  }).validator(),
  run({ token }) {
    const appToken = Promise.await(
      FB.api("oauth/access_token", {
        client_id: Meteor.settings.facebook.clientId,
        client_secret: Meteor.settings.facebook.clientSecret,
        grant_type: "client_credentials",
      })
    );
    const response = Promise.await(
      FB.api("debug_token", {
        input_token: token,
        access_token: appToken.access_token,
      })
    );
    if (!response.data || (response.data && !response.data.is_valid)) {
      throw new Meteor.Error(401, "Invalid access token");
    }
    if (response.data && !validatePermissions(response.data.scopes)) {
      throw new Meteor.Error(401, "Missing scope permissions");
    }
    return;
  },
});

export const validateCampaigner = new ValidatedMethod({
  name: "users.validateCampaigner",
  validate: new SimpleSchema({
    invite: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ invite }) {
    this.unblock();
    const userId = Meteor.userId();
    const user = Meteor.users.findOne(userId);
    if (!userId || !user) {
      throw new Meteor.Error(400, "Invalid user");
    }
    let res = {
      validUser: false,
      enabled: true,
    };
    if (user.services.facebook) {
      const tokenData = UsersHelpers.debugFBToken({
        token: user.services.facebook.accessToken,
      });
      res.validUser =
        user.type == "campaigner" && validatePermissions(tokenData.scopes);
    }
    if (PRIVATE && !Roles.userIsInRole(userId, ["admin", "moderator"])) {
      res.enabled = CampaignsHelpers.validateInvite({ invite });
    }
    return res;
  },
});

export const setUserType = new ValidatedMethod({
  name: "users.setType",
  validate: new SimpleSchema({
    type: {
      type: String,
      allowedValues: ["campaigner", "user"],
    },
    token: {
      type: String,
      optional: true,
    },
    secret: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ type, token, secret }) {
    const userId = Meteor.userId();
    logger.debug("users.setType called", { userId });

    if (!userId) {
      throw new Meteor.Error(400, "You must be logged in");
    }

    if (type == "campaigner") {
      if (token && secret) {
        UsersHelpers.updateFBToken({ userId, token, secret });
      }
      Meteor.users.update(userId, { $set: { type: "campaigner" } });
    } else {
      Meteor.users.update(userId, { $set: { type } });
    }
  },
});

export const removeUser = new ValidatedMethod({
  name: "users.remove",
  validate: new SimpleSchema({
    userId: {
      type: String,
    },
  }).validator(),
  run({ userId }) {
    logger.debug("users.remove called", { userId });

    const currentUser = Meteor.userId();
    if (!currentUser) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(currentUser, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return UsersHelpers.removeUser({ userId });
  },
});

export const removeSelfUser = new ValidatedMethod({
  name: "users.removeSelf",
  validate() {},
  run() {
    logger.debug("users.removeSelf called");

    const currentUser = Meteor.userId();
    if (!currentUser) {
      throw new Meteor.Error(401, "You need to login");
    }

    return UsersHelpers.removeUser({ userId: currentUser });
  },
});

export const exchangeFBToken = new ValidatedMethod({
  name: "users.exchangeFBToken",
  validate() {},
  run() {
    this.unblock();
    logger.debug("users.exchangeFBToken called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const user = Meteor.users.findOne(userId);

    let token = user.services.facebook.accessToken;

    if (!token) {
      throw new Meteor.Error(401, "No token was found.");
    }

    token = UsersHelpers.exchangeFBToken({ token });

    Meteor.users.update(userId, {
      $set: {
        "services.facebook.accessToken": token.result,
      },
    });

    return token;
  },
});

export const usersSearch = new ValidatedMethod({
  name: "users.search",
  validate: new SimpleSchema({
    search: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ search }) {
    this.unblock();
    logger.debug("users.search called", { search });

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

    return Meteor.users.find(selector, options).fetch();
  },
});

export const usersSelectGet = new ValidatedMethod({
  name: "users.selectGet",
  validate: new SimpleSchema({
    userId: {
      type: String,
    },
  }).validator(),
  run({ userId }) {
    this.unblock();
    logger.debug("users.selectGet called", { userId });

    const currentUser = Meteor.userId();
    if (!currentUser) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(currentUser, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let selector = { _id: userId };
    let options = {
      fields: {
        name: 1,
      },
    };

    const user = Meteor.users.findOne(selector, options);

    return user;
  },
});

export const usersQueryCount = new ValidatedMethod({
  name: "users.queryCount",
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
    return Meteor.users.find(query || {}).count();
  },
});

export const usersExport = new ValidatedMethod({
  name: "users.export",
  validate() {},
  run() {
    logger.debug("users.export called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const processUser = (user) => {
      if (user.emails && Array.isArray(user.emails))
        user.emails = user.emails.map((e) => e.address).join(",");
      user.campaignIds = Campaigns.find(
        {
          users: { $elemMatch: { userId: user._id } },
        },
        { fields: { name: 1 } }
      )
        .fetch()
        .map((campaign) => campaign._id)
        .join(",");
      delete user.profile;
      delete user.email;
      delete user.services;
      delete user.roles;
      return { ...user };
    };

    const users = Meteor.users.find().fetch();

    const flattened = [];
    const headersMap = {};
    for (const user of users) {
      const flattenedUser = flattenObject(processUser(user));
      for (const header in flattenedUser) {
        headersMap[header] = true;
      }
      flattened.push(flattenedUser);
    }

    return Papa.unparse({ fields: Object.keys(headersMap), data: flattened });
  },
});
