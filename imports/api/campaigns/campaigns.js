import SimpleSchema from "simpl-schema";

const Campaigns = new Mongo.Collection("campaigns");

Campaigns.usersSchema = new SimpleSchema({
  userId: {
    type: String,
    index: 1
  },
  role: {
    type: String,
    allowedValues: ["owner", "manager"]
  }
});

Campaigns.accountsSchema = new SimpleSchema({
  facebookId: {
    type: String
  },
  accessToken: {
    type: String
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
  accounts: {
    type: Array,
    optional: true
  },
  adAccountId: {
    type: String,
    optional: true
  },
  "accounts.$": {
    type: Campaigns.accountsSchema
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
