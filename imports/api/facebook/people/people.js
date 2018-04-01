import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: 1,
    optional: true
  },
  name: {
    type: String,
    index: "text"
  },
  campaignId: {
    type: String,
    index: 1
  },
  campaignMeta: {
    type: Object,
    blackbox: true,
    optional: true
  },
  facebookAccounts: {
    type: Array,
    optional: true,
    index: 1
  },
  "facebookAccounts.$": {
    type: String
  },
  counts: {
    type: Object,
    blackbox: true,
    optional: true
  },
  createdAt: {
    type: Date,
    index: 1,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  },
  updatedAt: {
    type: Date,
    index: 1,
    autoValue() {
      return new Date();
    }
  }
});

People.attachSchema(People.schema);

if (Meteor.isServer) {
  People._ensureIndex({
    name: "text"
  });
}

exports.People = People;
