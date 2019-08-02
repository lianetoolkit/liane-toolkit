import SimpleSchema from "simpl-schema";
import { UsersHelpers } from "./usersHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { difference } from "lodash";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const updateUser = new ValidatedMethod({
  name: "users.update",
  validate: new SimpleSchema({
    _id: {
      type: String
    },
    name: {
      type: String
    },
    roles: {
      type: Array
    },
    "roles.$": {
      type: String
    }
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
          roles
        }
      }
    );
    return;
  }
});

const validatePermissions = scopes => {
  const permissions = [
    "public_profile",
    "email",
    "publish_pages",
    "manage_pages",
    "pages_show_list",
    "ads_management",
    "ads_read",
    "business_management",
    "pages_messaging",
    "pages_messaging_phone_number",
    "pages_messaging_subscriptions"
  ];
  return !difference(permissions, scopes || []).length;
};

export const validateFBToken = new ValidatedMethod({
  name: "users.validateToken",
  validate: new SimpleSchema({
    token: {
      type: String
    }
  }).validator(),
  run({ token }) {
    const appToken = Promise.await(
      FB.api("oauth/access_token", {
        client_id: Meteor.settings.facebook.clientId,
        client_secret: Meteor.settings.facebook.clientSecret,
        grant_type: "client_credentials"
      })
    );
    const response = Promise.await(
      FB.api("debug_token", {
        input_token: token,
        access_token: appToken.access_token
      })
    );
    if (!response.data || (response.data && !response.data.is_valid)) {
      throw new Meteor.Error(401, "Invalid access token");
    }
    return;
  }
});

export const removeUser = new ValidatedMethod({
  name: "users.remove",
  validate: new SimpleSchema({
    userId: {
      type: String
    }
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

    return Meteor.users.remove(userId);
  }
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
        "services.facebook.accessToken": token.result
      }
    });

    return token;
  }
});

export const getAdAccounts = new ValidatedMethod({
  name: "users.getAdAccounts",
  validate() {},
  run() {
    this.unblock();
    logger.debug("users.getAdAccounts called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const user = Meteor.users.findOne(userId);

    const token = user.services.facebook.accessToken;

    return UsersHelpers.getUserAdAccounts({ token });
  }
});
