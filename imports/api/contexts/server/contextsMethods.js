import SimpleSchema from "simpl-schema";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

const schemaConfig = {
  name: {
    type: String
  },
  mainGeolocationId: {
    type: String
  },
  geolocations: {
    type: Array
  },
  "geolocations.$": {
    type: String
  },
  audienceCategories: {
    type: Array
  },
  "audienceCategories.$": {
    type: String
  }
};

const validateCreate = new SimpleSchema(schemaConfig).validator();
const validateUpdate = new SimpleSchema(
  Object.assign({ _id: { type: String } }, schemaConfig)
).validator();

export const createContext = new ValidatedMethod({
  name: "contexts.create",
  validate: validateCreate,
  run({ name, geolocations, audienceCategories }) {
    logger.debug("contexts.create called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = { name, geolocations, audienceCategories };
    return Contexts.insert(insertDoc);
  }
});

export const updateContext = new ValidatedMethod({
  name: "contexts.update",
  validate: validateUpdate,
  run({ _id, name, mainGeolocationId, geolocations, audienceCategories }) {
    logger.debug("contexts.update called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = {
      name,
      mainGeolocationId,
      geolocations,
      audienceCategories
    };

    Contexts.upsert({ _id }, { $set: insertDoc });

    return true;
  }
});

export const removeContext = new ValidatedMethod({
  name: "contexts.remove",
  validate: new SimpleSchema({
    contextId: {
      type: String
    }
  }).validator(),
  run({ contextId }) {
    logger.debug("contexts.remove called", { contextId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return Contexts.remove(contextId);
  }
});
