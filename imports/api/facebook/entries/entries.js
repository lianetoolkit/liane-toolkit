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
    type: String
  },
  message: {
    type: String,
    optional: true
  },
  objectId: {
    type: String,
    optional: true
  },
  parentId: {
    type: String,
    optional: true
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
