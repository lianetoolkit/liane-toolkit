import SimpleSchema from "simpl-schema";

const MapLayers = new Mongo.Collection("map_layers");

MapLayers.schema = new SimpleSchema({
  campaignId: {
    type: String,
    index: true
  },
  title: {
    type: String
  },
  description: {
    type: String,
    optional: true
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

MapLayers.attachSchema(MapLayers.schema);

exports.MapLayers = MapLayers;
