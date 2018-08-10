import SimpleSchema from "simpl-schema";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

const schemaConfig = {
  name: {
    type: String
  },
  country: {
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
  run({ name, country, mainGeolocationId, geolocations, audienceCategories }) {
    logger.debug("contexts.create called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = {
      name,
      country,
      mainGeolocationId,
      geolocations,
      audienceCategories
    };
    return Contexts.insert(insertDoc);
  }
});

export const updateContext = new ValidatedMethod({
  name: "contexts.update",
  validate: validateUpdate,
  run({
    _id,
    name,
    country,
    mainGeolocationId,
    geolocations,
    audienceCategories
  }) {
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
      country,
      mainGeolocationId,
      geolocations,
      audienceCategories
    };

    Contexts.update({ _id }, { $set: insertDoc });

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

export const exportContext = new ValidatedMethod({
  name: "contexts.export",
  validate: new SimpleSchema({
    contextId: {
      type: String
    }
  }).validator(),
  run({ contextId }) {
    logger.debug("contexts.export called", { contextId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const context = Contexts.findOne(contextId);

    const geolocations = Geolocations.find({
      _id: { $in: [...context.geolocations, context.mainGeolocationId] }
    }).fetch();

    const categories = AudienceCategories.find({
      _id: { $in: context.audienceCategories }
    }).fetch();

    return {
      context,
      geolocations,
      categories
    };
  }
});

export const importContext = new ValidatedMethod({
  name: "contexts.import",
  validate: new SimpleSchema({
    fileInfo: {
      type: Object,
      blackbox: true
    },
    fileData: {
      type: String
    }
  }).validator(),
  run({ fileInfo, fileData }) {
    logger.debug("contexts.import called", { fileInfo });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }
    if (fileInfo.type !== "application/json" && fileInfo.type !== "text/json") {
      throw new Meteor.Error(
        500,
        "File format not accepted. Must be of JSON format."
      );
    }

    const data = JSON.parse(fileData);

    // Import geolocations
    if (data.geolocations && data.geolocations.length) {
      for (const geolocation of data.geolocations) {
        Geolocations.upsert(
          {
            _id: geolocation._id
          },
          { $set: geolocation }
        );
      }
    }

    // Import audience categories
    if (data.categories && data.categories.length) {
      for (const category of data.categories) {
        AudienceCategories.upsert(
          {
            _id: category._id
          },
          { $set: category }
        );
      }
    }

    // Import context
    Contexts.upsert(
      {
        _id: data.context._id
      },
      {
        $set: data.context
      }
    );

    return true;
  }
});
