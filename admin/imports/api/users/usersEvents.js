const { SimpleSchema } = require("meteor/aldeed:simple-schema");

const UsersEvents = new Mongo.Collection("users_events");

UsersEvents.eventTypes = ["signup", "sendEmail"];

UsersEvents.schema = new SimpleSchema({
  userId: {
    type: String,
    index: true
  },
  eventType: {
    type: String,
    allowedValues: UsersEvents.eventTypes
  },
  extraFields: {
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

UsersEvents.attachSchema(UsersEvents.schema);

exports.UsersEvents = UsersEvents;
