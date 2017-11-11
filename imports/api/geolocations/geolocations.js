import SimpleSchema from "simpl-schema";

const Geolocations = new Mongo.Collection("geolocations");

Geolocations.schema = new SimpleSchema({
  name: {
    type: String,
    index: true
  },
  facebookId: {
    type: String
  },
  geoId: {
    type: String
  },
  center: {
    type: Geolocations.centerSchema
  },
  polygon: {
    type: Object,
    optional: true,
    blackbox: true
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

Geolocations.attachSchema(Geolocations.schema);

exports.Geolocations = Geolocations;
