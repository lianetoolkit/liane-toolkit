import SimpleSchema from "simpl-schema";

const Contexts = new Mongo.Collection("contexts");

Contexts.schema = new SimpleSchema({
  name: {
    type: String,
    index: true
  },
  mainGeolocationId: {
    type: String,
    optional: true
  },
  geolocations: {
    type: [String],
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

Contexts.attachSchema(Contexts.schema);

exports.Campaigns = Contexts;
