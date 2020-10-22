import SimpleSchema from "simpl-schema";

const Messages = new Mongo.Collection("messages");

Messages.schema = new SimpleSchema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  type: {
    type: String,
    allowedValues: ["users", "campaigns"],
  },
  recipientCount: {
    type: String,
    index: true,
  },
  recipientQuery: {
    type: Object,
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

Messages.attachSchema(Messages.schema);

exports.Messages = Messages;
