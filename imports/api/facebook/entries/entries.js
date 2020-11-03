import SimpleSchema from "simpl-schema";

const Entries = new Mongo.Collection("entries");

Entries.schema = new SimpleSchema({
  _id: {
    type: String,
    label: "Facebook Id"
  },
  facebookAccountId: {
    type: String,
    index: true
  },
  type: {
    type: String,
    index: true,
    optional: true
  },
  message: {
    type: String,
    optional: true
  },
  objectId: {
    type: String,
    optional: true,
    index: true
  },
  parentId: {
    type: String,
    optional: true,
    index: true
  },
  link: {
    type: String,
    optional: true
  },
  updatedTime: {
    type: Date
  },
  createdTime: {
    type: Date
  },
  counts: {
    type: Object
  },
  "counts.reaction": {
    type: Number
  },
  "counts.like": {
    type: Number
  },
  "counts.love": {
    type: Number
  },
  "counts.wow": {
    type: Number
  },
  "counts.haha": {
    type: Number
  },
  "counts.sad": {
    type: Number
  },
  "counts.angry": {
    type: Number
  },
  "counts.thankful": {
    type: Number
  },
  "counts.comment": {
    type: Number
  },
  "counts.share": {
    type: Number
  },
  source: {
    type: String,
    optional: true
  },
  source_data: {
    type: Object,
    blackbox: true,
    optional: true,
  }
});

Entries.attachSchema(Entries.schema);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Entries.rawCollection().createIndex({
      message: "text"
    });
  }
});

exports.Entries = Entries;
