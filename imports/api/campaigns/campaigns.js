import SimpleSchema from "simpl-schema";

const Campaigns = new Mongo.Collection("campaigns");

Campaigns.usersSchema = new SimpleSchema({
  userId: {
    type: String,
    index: 1
  },
  role: {
    type: String,
    allowedValues: ["owner", "manager", "guest"]
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

Campaigns.audienceAccountsSchema = new SimpleSchema({
  facebookId: {
    type: String
  },
  name: {
    type: String
  },
  fanCount: {
    type: String,
    optional: true
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
  autoReplyMessage: {
    type: String,
    optional: true
  },
  description: {
    type: String,
    optional: true
  },
  adAccountId: {
    type: String,
    optional: true
  },
  status: {
    type: String,
    optional: true
  },
  accounts: {
    type: Array,
    optional: true
  },
  "accounts.$": {
    type: Campaigns.accountsSchema
  },
  audienceAccounts: {
    type: Array,
    optional: true
  },
  "audienceAccounts.$": {
    type: Campaigns.audienceAccountsSchema
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
