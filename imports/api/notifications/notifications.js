import SimpleSchema from "simpl-schema";

const Notifications = new Mongo.Collection("notifications");

Notifications.schema = new SimpleSchema({
  text: {
    type: String
  },
  category: {
    type: String
  },
  read: {
    type: Boolean,
    defaultValue: false
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

Notifications.attachSchema(Notifications.schema);

exports.Notifications = Notifications;
