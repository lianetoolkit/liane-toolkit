import SimpleSchema from "simpl-schema";

const People = new Mongo.Collection("people");

People.schema = new SimpleSchema({
  facebookId: {
    type: String
  },
  name: {
    type: String
  },
  campaignId: {
    type: String,
    index: 1
  },
  facebookAccounts: {
    type: Array,
    index: 1
  },
  "facebookAccounts.$": {
    type: String
  },
  likesCount: {
    type: Number,
    optional: true,
    defaultValue: 0
  },
  commentsCount: {
    type: Number,
    defaultValue: 0,
    optional: true
  },
  campaignMeta: {
    type: Object,
    blackbox: true,
    optional: true
  }
});

People.attachSchema(People.schema);

exports.People = People;
