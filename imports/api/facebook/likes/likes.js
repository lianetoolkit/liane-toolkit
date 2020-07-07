import SimpleSchema from "simpl-schema";

const Likes = new Mongo.Collection("likes");

Likes.schema = new SimpleSchema({
  facebookAccountId: {
    type: String,
    index: true,
  },
  entryId: {
    type: String,
    index: true,
  },
  parentId: {
    type: String,
    optional: true,
    index: true,
  },
  personId: {
    type: String,
    index: true,
  },
  name: {
    type: String,
    index: true,
  },
  type: {
    type: String,
    optional: true,
    index: true,
  },
  created_time: {
    type: Date,
    optional: true,
    index: true,
  },
  resolved: {
    type: Boolean,
    optional: true,
    index: true,
  },
});

Likes.attachSchema(Likes.schema);

exports.Likes = Likes;
