import SimpleSchema from "simpl-schema";

const People = new Mongo.Collection("people");

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
  counts: {
    type: Object,
    blackbox: true,
    optional: true
  },
  formId: {
    type: String,
    index: true,
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
    People.rawCollection().dropIndex("name_text");
    People.rawCollection().dropIndex(
      "campaignMeta.influencer_1_campaignMeta.voteIntent_1_campaignMeta.starred_1_campaignMeta.troll_1"
    );
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
