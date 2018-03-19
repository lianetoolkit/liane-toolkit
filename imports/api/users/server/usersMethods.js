import SimpleSchema from "simpl-schema";
import { UsersHelpers } from "./usersHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const validatePermissions = new ValidatedMethod({
  name: "users.validatePermissions",
  validate() {},
  run() {
    this.unblock();
    logger.debug("users.validatePermissions called");
    const userId = Meteor.userId();
    const permissions = UsersHelpers.getFacebookPermissions({ userId });
  }
});

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
