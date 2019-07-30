import SimpleSchema from "simpl-schema";
import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import axios from "axios";
import { ValidatedMethod } from "meteor/mdg:validated-method";

const schemaConfig = {
  campaignId: {
    type: String
  },
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
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

export const createMapLayer = new ValidatedMethod({
  name: "mapLayers.create",
  validate: validateCreate,
  run({ campaignId, title, description }) {
    logger.debug("mapLayers.create called", { campaignId, title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Meteor.call("campaigns.canManage", { campaignId, userId }))
      throw new Meteor.Error(400, "Permission denied");

    let insertDoc = {
      campaignId,
      title,
      description
    };

    return MapLayers.insert(insertDoc);
  }
});

export const updateMapLayer = new ValidatedMethod({
  name: "mapLayers.update",
  validate: validateUpdate,
  run({ _id, campaignId, title, description }) {
    logger.debug("mapLayers.update called", { _id, campaignId, title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Meteor.call("campaigns.canManage", { campaignId, userId }))
      throw new Meteor.Error(400, "Permission denied");

    let updateDoc = {
      title,
      description
    };

    MapLayers.update({ _id }, { $set: updateDoc });
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

    const mapLayer = MapLayers.findOne(mapLayerId);

    if (mapLayer) {
      throw new Meteor.Error(404, "Map layer not found");
    }

    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: mapLayer.campaignId,
        userId
      })
    )
      throw new Meteor.Error(400, "Permission denied");

    return MapLayers.remove(mapLayerId);
  }
});

export const getCampaignMapLayers = new ValidatedMethod({
  name: "mapLayers.byCampaign",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("mapLayers.byCampaign called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Meteor.call("campaigns.canManage", { campaignId, userId }))
      throw new Meteor.Error(400, "Permission denied");

    return MapLayers.find({ campaignId }).fetch();
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
    logger.debug("mapLayer.get called", { mapLayerId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const mapLayer = MapLayers.findOne(mapLayerId);

    if (mapLayer) {
      throw new Meteor.Error(404, "Map layer not found");
    }

    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: mapLayer.campaignId,
        userId
      })
    )
      throw new Meteor.Error(400, "Permission denied");

    return MapLayers.findOne(mapLayerId);
  }
});
