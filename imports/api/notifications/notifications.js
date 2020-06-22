import SimpleSchema from "simpl-schema";

const Notifications = new Mongo.Collection("notifications");

Notifications.schema = new SimpleSchema({
  userId: {
    type: String,
    optional: true,
    index: true,
  },
  campaignId: {
    type: String,
    optional: true,
    index: true,
  },
  text: {
    type: String,
    optional: true,
  },
  metadata: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  path: {
    type: String,
    optional: true,
  },
  category: {
    type: String,
    index: 1,
    optional: true,
  },
  dataRef: {
    type: String,
    optional: true,
    index: 1,
  },
  read: {
    type: Boolean,
    defaultValue: false,
    index: true,
  },
  removable: {
    type: Boolean,
    defaultValue: true,
    index: true,
  },
  sticky: {
    type: Boolean,
    defaultValue: false,
    index: true,
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

Notifications.attachSchema(Notifications.schema);

exports.Notifications = Notifications;
