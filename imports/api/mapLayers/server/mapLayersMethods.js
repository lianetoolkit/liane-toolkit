import SimpleSchema from "simpl-schema";
import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";

const schemaConfig = {
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  tilelayer: {
    type: String
  },
  tilejson: {
    type: String,
    optional: true
  },
  category: {
    type: String
  },
  tags: {
    type: Array,
    optional: true
  },
  "tags.$": {
    type: String
  }
};

const taxSchemaConfig = {
  name: {
    type: String
  }
};

const validateCreate = new SimpleSchema(schemaConfig).validator();
const validateUpdate = new SimpleSchema({
  ...schemaConfig,
  _id: { type: String }
}).validator();

const taxValidateCreate = new SimpleSchema(taxSchemaConfig).validator();
const taxValidateUpdate = new SimpleSchema({
  ...taxSchemaConfig,
  _id: { type: String }
}).validator();

export const createMapLayer = new ValidatedMethod({
  name: "mapLayers.create",
  validate: validateCreate,
  run({ title, description, tilelayer, tilejson, category, tags }) {
    logger.debug("mapLayers.create called", { title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = {
      title,
      description,
      tilelayer,
      tilejson,
      category,
      tags
    };
    return MapLayers.insert(insertDoc);
  }
});

export const createTag = new ValidatedMethod({
  name: "mapLayers.createTag",
  validate: taxValidateCreate,
  run({ name }) {
    logger.debug("mapLayers.createTag", { name });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return MapLayersTags.insert({ name });
  }
});

export const createCategory = new ValidatedMethod({
  name: "mapLayers.createCategory",
  validate: taxValidateCreate,
  run({ name }) {
    logger.debug("mapLayers.createCategory", { name });
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return MapLayersCategories.insert({ name });
  }
});

export const updateMapLayer = new ValidatedMethod({
  name: "mapLayers.update",
  validate: validateUpdate,
  run({ _id, title, description, tilelayer, tilejson, category, tags }) {
    logger.debug("mapLayers.update called", { title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = {
      title,
      description,
      tilelayer,
      tilejson,
      category,
      tags
    };

    MapLayers.update({ _id }, { $set: insertDoc });
    return;
  }
});

export const removeMapLayer = new ValidatedMethod({
  name: "mapLayers.remove",
  validate: new SimpleSchema({
    mapLayerId: {
      type: String
    }
  }).validator(),
  run({ mapLayerId }) {
    logger.debug("mapLayers.remove called", { mapLayerId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return MapLayers.remove(mapLayerId);
  }
});

export const getMapLayer = new ValidatedMethod({
  name: "mapLayers.get",
  validate: new SimpleSchema({
    mapLayerId: {
      type: String
    }
  }).validator(),
  run({ mapLayerId }) {
    return MapLayers.findOne(mapLayerId);
  }
});

export const getMapLayersCategories = new ValidatedMethod({
  name: "mapLayers.getCategories",
  validate: new SimpleSchema({
    categoryId: {
      type: String,
      optional: true
    }
  }).validator(),
  run() {
    return MapLayersCategories.find().fetch();
  }
});

export const getMapLayersTags = new ValidatedMethod({
  name: "mapLayers.getTags",
  validate: new SimpleSchema({
    tagId: {
      type: String,
      optional: true
    }
  }).validator(),
  run() {
    return MapLayersTags.find().fetch();
  }
});
