import SimpleSchema from "simpl-schema";
import { Index, MongoDBEngine } from "meteor/easy:search";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

const People = new Mongo.Collection("people");

People.lastInteractionsSchema = new SimpleSchema({
  facebookId: { type: String },
  date: { type: Date, optional: true },
  estimate: { type: Boolean, defaultValue: false }
});

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: true,
    optional: true
  },
  name: {
    type: String,
    index: true
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
  lastInteractionDate: {
    type: Date,
    optional: true,
    index: true
  },
  source: {
    type: String,
    optional: true,
    index: true
  },
  // lastInteraction: {
  //   type: Object,
  //   optional: true,
  //   index: true
  // },
  // "lastInteraction.date": {
  //   type: Date,
  //   optional: true,
  //   index: true
  // },
  // "lastInteraction.facebookId": {
  //   type: String,
  //   optional: true,
  //   index: true
  // },
  // "lastInteraction.estimate": {
  //   type: Boolean,
  //   defaultValue: false,
  //   optional: true,
  //   index: true
  // },
  // lastInteractions: {
  //   type: Array,
  //   index: true,
  //   optional: true
  // },
  // "lastInteractions.$": {
  //   type: People.lastInteractionsSchema
  // },
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
      "campaignMeta.contact.email": "text"
    });
    People.rawCollection().createIndex({
      facebookAccounts: 1
    });
    People.rawCollection().createIndex(
      {
        campaignId: 1,
        facebookAccounts: 1
      },
      { background: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.influencer": 1
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.voteIntent": 1
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.starred": 1
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.troll": 1
      },
      { sparse: true }
    );
  }
});

exports.People = People;
