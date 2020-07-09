import SimpleSchema from "simpl-schema";

const AccessLogs = new Mongo.Collection("access_logs");

AccessLogs.schema = new SimpleSchema({
  connectionId: {
    type: String,
    index: true,
  },
  ip: {
    type: String,
    index: true,
  },
  country: {
    type: String,
    index: true,
    optional: true,
  },
  campaignId: {
    type: String,
    index: true,
    optional: true,
  },
  userId: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    index: true,
  },
  path: {
    type: String,
    index: true,
    optional: true,
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  timestamp: {
    type: Number,
    autoValue() {
      if (this.isInsert) {
        return Date.now();
      } else if (this.isUpsert) {
        return { $setOnInsert: Date.now() };
      } else {
        return this.unset();
      }
    },
  },
});

AccessLogs.attachSchema(AccessLogs.schema);

exports.AccessLogs = AccessLogs;
