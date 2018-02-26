import SimpleSchema from "simpl-schema";

const FacebookAudiences = new Mongo.Collection("facebook_audiences");

FacebookAudiences.schema = new SimpleSchema({
  campaignId: {
    type: String,
    index: true
  },
  facebookAccountId: {
    type: String,
    index: true
  },
  geolocationId: {
    type: String,
    index: true
  },
  audienceCategoryId: {
    type: String,
    index: true
  },
  estimate: {
    type: Number
  },
  total: {
    type: Number
  },
  location_estimate: {
    type: Number
  },
  location_total: {
    type: Number
  },
  fetch_date: {
    type: String,
    label: "YYYY-MM-DD",
    index: 1
  },
  fan_count: {
    type: Number,
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

FacebookAudiences.attachSchema(FacebookAudiences.schema);

exports.FacebookAudiences = FacebookAudiences;
