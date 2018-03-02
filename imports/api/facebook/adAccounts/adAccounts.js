import SimpleSchema from "simpl-schema";

const AdAccounts = new Mongo.Collection("ad_accounts");

AdAccounts.schema = new SimpleSchema({
  users: {
    type: Array
  },
  "users.$": {
    type: Object,
    blackbox: true
  },
  currency: {
    type: String,
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

AdAccounts.attachSchema(AdAccounts.schema);

exports.AdAccounts = AdAccounts;
