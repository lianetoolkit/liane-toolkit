import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { MapFeatures } from "/imports/api/mapFeatures/mapFeatures.js";

export const createMapFeature = new ValidatedMethod({
  name: "mapFeatures.create",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    title: {
      type: String,
      optional: true
    },
    description: {
      type: String,
      optional: true
    },
    color: {
      type: String,
      optional: true
    },
    type: {
      type: String
    },
    geometry: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, title, description, color, type, geometry }) {
    this.unblock();
    logger.debug("mapFeatures.create", { campaignId, title, type });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "map",
        permission: "edit"
      })
    ) {
      throw new Meteor.Error(400, "Not allowed");
    }

    let insertDoc = { campaignId, type, geometry };

    if (title) insertDoc.title = title;
    if (description) insertDoc.description = description;
    if (color) insertDoc.color = color;

    const res = MapFeatures.insert(insertDoc);

    Meteor.call("log", {
      type: "map.features.add",
      campaignId,
      data: { mapFeatureId: res }
    });

    return res;
  }
});

export const updateMapFeature = new ValidatedMethod({
  name: "mapFeatures.update",
  validate: new SimpleSchema({
    id: {
      type: String
    },
    title: {
      type: String,
      optional: true
    },
    mapLayerId: {
      type: String,
      optional: true
    },
    description: {
      type: String,
      optional: true
    },
    color: {
      type: String,
      optional: true
    },
    type: {
      type: String,
      optional: true
    },
    geometry: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validator(),
  run({ id, title, mapLayerId, description, color, type, geometry }) {
    this.unblock();
    logger.debug("mapFeatures.update", { id });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const feature = MapFeatures.findOne(id);

    if (!feature) {
      throw new Meteor.Error(404, "Feature not found");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: feature.campaignId,
        userId,
        feature: "map",
        permission: "edit"
      })
    ) {
      throw new Meteor.Error(400, "Not allowed");
    }

    let $set = {};

    if (title) $set.title = title;
    if (mapLayerId) $set.mapLayerId = mapLayerId;
    if (description) $set.description = description;
    if (color) $set.color = color;
    if (type) $set.type = type;
    if (geometry) $set.geometry = geometry;

    const res = MapFeatures.update(id, { $set });

    Meteor.call("log", {
      type: "map.features.edit",
      campaignId: feature.campaignId,
      data: { mapFeatureId: id }
    });

    return res;
  }
});

export const removeMapFeature = new ValidatedMethod({
  name: "mapFeatures.remove",
  validate: new SimpleSchema({
    id: {
      type: String
    }
  }).validator(),
  run({ id }) {
    this.unblock();
    logger.debug("mapFeatures.remove", { id });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const feature = MapFeatures.findOne(id);

    if (!feature) {
      throw new Meteor.Error(404, "Feature not found");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: feature.campaignId,
        userId,
        feature: "map",
        permission: "edit"
      })
    ) {
      throw new Meteor.Error(400, "Not allowed");
    }

    const res = MapFeatures.remove(id);

    Meteor.call("log", {
      type: "map.features.remove",
      campaignId: feature.campaignId,
      data: { mapFeatureId: id }
    });

    return res;
  }
});
