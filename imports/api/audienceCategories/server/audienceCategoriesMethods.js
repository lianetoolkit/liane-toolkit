import SimpleSchema from "simpl-schema";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Facebook, FacebookApiException } from "fb";
import { AudienceCategoriesHelpers } from "./audienceCategoriesHelpers.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

const schemaConfig = {
  title: {
    type: String
  },
  spec: {
    type: Object,
    blackbox: true
  }
};

const validateCreate = new SimpleSchema(schemaConfig).validator();
const validateUpdate = new SimpleSchema(
  Object.assign({ _id: { type: String } }, schemaConfig)
).validator();

export const createAudienceCategory = new ValidatedMethod({
  name: "audienceCategories.create",
  validate: validateCreate,
  run({ title, spec }) {
    logger.debug("audienceCategories.create called", { title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = { title, spec };
    return AudienceCategories.insert(insertDoc);
  }
});

export const updateAudienceCategory = new ValidatedMethod({
  name: "audienceCategories.update",
  validate: validateUpdate,
  run({ _id, title, spec }) {
    logger.debug("audienceCategories.update called", { title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = { _id, title, spec };

    AudienceCategories.upsert({ _id }, { $set: insertDoc });
    return;
  }
});

export const removeAudienceCategory = new ValidatedMethod({
  name: "audienceCategories.remove",
  validate: new SimpleSchema({
    audienceCategoryId: {
      type: String
    }
  }).validator(),
  run({ audienceCategoryId }) {
    logger.debug("audienceCategories.remove called", { audienceCategoryId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return AudienceCategories.remove(audienceCategoryId);
  }
});

export const searchAdInterests = new ValidatedMethod({
  name: "audienceCategories.searchAdInterests",
  validate: new SimpleSchema({
    q: {
      type: String
    }
  }).validator(),
  run({ q }) {
    logger.debug("audienceCategories.searchAdInterests called", { q });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const user = Meteor.users.findOne(userId);

    return AudienceCategoriesHelpers.facebookSearch({
      type: "adinterest",
      accessToken: user.services.facebook.accessToken,
      q
    });
  }
});

export const searchAdInterestSuggestions = new ValidatedMethod({
  name: "audienceCategories.searchAdInterestSuggestions",
  validate: new SimpleSchema({
    interest_list: {
      type: Array
    },
    "interest_list.$": {
      type: String
    }
  }).validator(),
  run({ interest_list }) {
    logger.debug("audienceCategories.searchAdInterestSuggestions called", {
      interest_list
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const user = Meteor.users.findOne(userId);

    return AudienceCategoriesHelpers.getInterestSuggestions({
      accessToken: user.services.facebook.accessToken,
      interest_list
    });
  }
});
