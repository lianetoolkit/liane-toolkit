import SimpleSchema from "simpl-schema";

const Entries = new Mongo.Collection("entries");

Entries.schema = new SimpleSchema({
  _id: {
    type: String,
    label: "Facebook Id",
    index: true
  },
  facebookAccountId: {
    type: String,
    index: true,
    index: true
  },
  type: {
    type: String
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
    type: Object,
  },
  "counts.likes": {
    type: Number
  },
  "counts.comments": {
    type: Number
  },
  "counts.shares": {
    type: Number
  }
});

Entries.attachSchema(Entries.schema);

exports.Entries = Entries;
