import SimpleSchema from "simpl-schema";

const Campaigns = new Mongo.Collection("campaigns");

Campaigns.usersSchema = new SimpleSchema({
  userId: {
    type: String
  },
  role: {
    type: String,
    allowedValues: ["owner", "manager"]
  }
});

Campaigns.schema = new SimpleSchema({
  users: {
    type: Array
  },
  "users.$": {
    type: Campaigns.usersSchema
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
  facebookAccountsIds: {
    type: Array,
    optional: true
  },
  "facebookAccountsIds.$": {
    type: String
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
