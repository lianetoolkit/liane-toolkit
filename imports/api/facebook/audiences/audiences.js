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
    type: Match.OneOf(Number, { type: Object, blackbox: true }),
    blackbox: true
  },
  total: {
    type: Match.OneOf(Number, { type: Object, blackbox: true }),
    blackbox: true
  },
  location_estimate: {
    type: Match.OneOf(Number, { type: Object, blackbox: true }),
    blackbox: true
  },
  location_total: {
    type: Match.OneOf(Number, { type: Object, blackbox: true }),
    blackbox: true
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
