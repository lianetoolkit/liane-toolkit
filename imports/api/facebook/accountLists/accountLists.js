import SimpleSchema from "simpl-schema";

const AccountLists = new Mongo.Collection("account_lists");

AccountLists.accountsSchema = new SimpleSchema({
  facebookId: {
    type: String
  }
});

AccountLists.schema = new SimpleSchema({
  name: {
    type: String
  },
  campaignId: {
    type: String,
    index: true
  },
  accounts: {
    type: Array,
    optional: true
  },
  "accounts.$": {
    type: AccountLists.accountsSchema
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

AccountLists.attachSchema(AccountLists.schema);

exports.AccountLists = AccountLists;
