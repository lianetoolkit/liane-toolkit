import SimpleSchema from "simpl-schema";

const Entries = new Mongo.Collection("entries");

Entries.schema = new SimpleSchema({
  facebookAccountId: {
    type: String,
    index: true
  },
  id: {
    type: String
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
  updated_time: {
    type: Date
  },
  created_time: {
    type: Date
  }
});

Entries.attachSchema(Entries.schema);

exports.Entries = Entries;
