import SimpleSchema from "simpl-schema";

const MapLayers = new Mongo.Collection("map_layers");
const MapLayersCategories = new Mongo.Collection("map_layers_categories");
const MapLayersTags = new Mongo.Collection("map_layers_tags");

MapLayers.schema = new SimpleSchema({
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  tilelayer: {
    type: String,
    optional: true
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
  },
  domegisUrl: {
    type: String,
    optional: true
  },
  domegisId: {
    type: String,
    optional: true
  },
  bbox: {
    type: Array,
    optional: true
  },
  "bbox.$": {
    type: Array
  },
  "bbox.$.$": {
    type: Number
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  }
});

MapLayersCategories.schema = new SimpleSchema({
  name: {
    type: String
  }
});

MapLayersTags.schema = new SimpleSchema({
  name: {
    type: String
  }
});

MapLayers.attachSchema(MapLayers.schema);
MapLayersCategories.attachSchema(MapLayersCategories.schema);
MapLayersTags.attachSchema(MapLayersTags.schema);

exports.MapLayers = MapLayers;
exports.MapLayersCategories = MapLayersCategories;
exports.MapLayersTags = MapLayersTags;
