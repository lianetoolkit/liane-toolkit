import SimpleSchema from "simpl-schema";

const MapFeatures = new Mongo.Collection("map_features");

MapFeatures.schema = new SimpleSchema({
  campaignId: {
    type: String
  },
  mapLayerId: {
    type: String,
    index: true,
    optional: true
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
    type: String,
    allowedValues: ["point", "line", "polygon"]
  },
  geometry: {
    type: Object
  },
  "geometry.type": {
    type: String,
    allowedValues: ["LineString", "Polygon", "Point"]
  },
  "geometry.coordinates": {
    type: Array,
    maxCount: 200
  },
  "geometry.coordinates.$": {
    type: SimpleSchema.oneOf(Number, { type: Array, maxCount: 200 })
  },
  "geometry.coordinates.$.$": {
    type: SimpleSchema.oneOf(Number, { type: Array, maxCount: 2 })
  },
  "geometry.coordinates.$.$.$": {
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

MapFeatures.attachSchema(MapFeatures.schema);

exports.MapFeatures = MapFeatures;
