import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: true,
    optional: true
  },
  name: {
    type: String,
    index: "text"
  },
  campaignId: {
    type: String,
    index: true
  },
  campaignMeta: {
    type: Object,
    blackbox: true,
    optional: true
  },
  facebookAccounts: {
    type: Array,
    optional: true,
    index: true
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
    index: true,
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
    index: true,
    autoValue() {
      return new Date();
    }
  }
});

People.attachSchema(People.schema);

Meteor.startup(() => {
  if (Meteor.isServer) {
    People.rawCollection().createIndex({
      name: "text",
      facebookAccounts: true
    });
    People.rawCollection().createIndex({
      "campaignMeta.influencer": true,
      "campaignMeta.voteIntent": true,
      "campaignMeta.starred": true,
      "campaignMeta.troll": true
    });
  }
});

exports.People = People;
