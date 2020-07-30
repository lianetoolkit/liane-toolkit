import SimpleSchema from "simpl-schema";

const Geolocations = new Mongo.Collection("geolocations");

Geolocations.schema = new SimpleSchema({
  name: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ["location", "center"],
    index: true,
  },
  regionType: {
    type: String,
    allowedValues: ["country", "state", "city"],
    index: true,
    optional: true,
  },
  parentId: {
    type: String,
    optional: true,
    index: true,
  },
  facebook: {
    type: Array,
    optional: true,
  },
  "facebook.$": {
    type: Object,
    blackbox: true,
  },
  osm: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  geoId: {
    type: String,
    optional: true,
  },
  center: {
    type: Array,
    optional: true,
  },
  "center.$": {
    type: String,
  },
  geojson: {
    type: Object,
    optional: true,
    blackbox: true,
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
    },
  },
});

Geolocations.attachSchema(Geolocations.schema);

exports.Geolocations = Geolocations;
