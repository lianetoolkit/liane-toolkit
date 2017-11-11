import SimpleSchema from "simpl-schema";

const Campaigns = new Mongo.Collection("campaigns");

Campaigns.schema = new SimpleSchema({
  userId: {
    type: String,
    index: true
  },
  contextId: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  allowedUsers: {
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

Campaigns.attachSchema(Campaigns.schema);

exports.Campaigns = Campaigns;
