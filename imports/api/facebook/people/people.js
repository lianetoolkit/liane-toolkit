import SimpleSchema from "simpl-schema";

const People = new Mongo.Collection("people");
const PeopleTags = new Mongo.Collection("people_tags");
const PeopleLists = new Mongo.Collection("people_lists");
const PeopleExports = new Mongo.Collection("people_exports");

People.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: true,
    optional: true,
    unique: true,
  },
  name: {
    type: String,
    index: true,
    optional: true,
  },
  campaignId: {
    type: String,
    index: true,
  },
  campaignMeta: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  facebookAccountId: {
    type: String,
    optional: true,
    index: true,
  },
  facebookAccounts: {
    type: Array,
    optional: true,
    index: true,
  },
  "facebookAccounts.$": {
    type: String,
  },
  lastInteractionDate: {
    type: Date,
    optional: true,
    index: true,
  },
  source: {
    type: String,
    optional: true,
    index: true,
  },
  canReceivePrivateReply: {
    type: Array,
    optional: true,
    index: true,
  },
  "canReceivePrivateReply.$": {
    type: String,
  },
  receivedAutoPrivateReply: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    index: true,
  },
  imported: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    index: true,
  },
  unresolved: {
    type: Boolean,
    defaultValue: false,
    optional: true,
    index: true,
  },
  related: {
    type: Array,
    optional: true,
  },
  "related.$": {
    type: String,
  },
  listId: {
    type: String,
    optional: true,
    index: true,
  },
  filledForm: {
    type: Boolean,
    optional: true,
    index: true,
  },
  counts: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  formId: {
    type: String,
    index: true,
    optional: true,
  },
  location: {
    type: Object,
    optional: true,
  },
  "location.formattedAddress": {
    type: String,
    optional: true,
  },
  "location.coordinates": {
    type: Array,
    minCount: 2,
    maxCount: 2,
    optional: true,
  },
  "location.coordinates.$": {
    type: Number,
  },
  chatbotStatus: {
    type: String,
    allowedValues: ["bot", "pending", "admin"],
    optional: true,
    index: true,
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
    },
  },
  updatedAt: {
    type: Date,
    index: true,
    autoValue() {
      return new Date();
    },
  },
});

PeopleTags.schema = new SimpleSchema({
  name: {
    type: String,
    index: true,
  },
  campaignId: {
    type: String,
    index: true,
  },
});

PeopleLists.schema = new SimpleSchema({
  name: {
    type: String,
    index: true,
  },
  campaignId: {
    type: String,
    index: true,
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
    },
  },
});

PeopleExports.schema = new SimpleSchema({
  campaignId: {
    type: String,
    index: true,
  },
  count: {
    type: Number,
    index: true,
  },
  url: {
    type: String,
  },
  path: {
    type: String,
  },
  expired: {
    type: Boolean,
    index: true,
    defaultValue: false,
  },
  expiresAt: {
    type: Date,
    index: true,
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
    },
  },
});

People.attachSchema(People.schema);
PeopleTags.attachSchema(PeopleTags.schema);
PeopleLists.attachSchema(PeopleLists.schema);
PeopleExports.attachSchema(PeopleExports.schema);

Meteor.startup(() => {
  if (Meteor.isServer) {
    People.rawCollection().createIndex({
      name: "text",
      "campaignMeta.contact.email": "text",
    });
    People.rawCollection().createIndex(
      {
        "campaignMeta.social_networks.instagram": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.social_networks.twitter": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        campaignId: 1,
        facebookAccounts: 1,
      },
      { background: true }
    );
    People.rawCollection().createIndex(
      {
        "counts.facebook.likes": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "counts.facebook.comments": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "counts.instagram.comments": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "counts.totalComments": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.influencer": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.voteIntent": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.starred": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.troll": 1,
      },
      { sparse: true }
    );
    People.rawCollection().createIndex(
      {
        "campaignMeta.basic_info.tags": 1,
      },
      { sparse: true }
    );
  }
});

exports.People = People;
exports.PeopleTags = PeopleTags;
exports.PeopleLists = PeopleLists;
exports.PeopleExports = PeopleExports;
