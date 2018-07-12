import SimpleSchema from "simpl-schema";

const Contexts = new Mongo.Collection("contexts");

Contexts.schema = new SimpleSchema({
  name: {
    type: String
  },
  mainGeolocationId: {
    type: String,
    optional: true
  },
  geolocations: {
    type: Array,
    optional: true
  },
  "geolocations.$": {
    type: String
  },
  audienceCategories: {
    type: Array,
    optional: true
  },
  "audienceCategories.$": {
    type: String
  },
  mapLayers: {
    type: Array,
    optional: true
  },
  "mapLayers.$": {
    type: String
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

Contexts.attachSchema(Contexts.schema);

exports.Contexts = Contexts;
