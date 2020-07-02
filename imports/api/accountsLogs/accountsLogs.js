import SimpleSchema from "simpl-schema";

const AccountsLogs = new Mongo.Collection("accounts_logs");

AccountsLogs.schema = new SimpleSchema({
  accountId: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    index: true,
  },
  personId: {
    type: String,
    index: true,
  },
  objectType: {
    type: String,
    index: true,
    optional: true,
  },
  objectId: {
    type: String,
    index: true,
    optional: true,
  },
  parentId: {
    type: String,
    index: true,
    optional: true,
  },
  isAdmin: {
    type: Boolean,
    defaultValue: false,
    index: true,
    optional: true,
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  timestamp: {
    type: Number,
    autoValue() {
      if (this.isInsert) {
        return Date.now();
      } else if (this.isUpsert) {
        return { $setOnInsert: Date.now() };
      } else {
        return this.unset();
      }
    },
  },
});

AccountsLogs.attachSchema(AccountsLogs.schema);

exports.AccountsLogs = AccountsLogs;
