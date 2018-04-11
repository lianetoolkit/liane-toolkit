import SimpleSchema from "simpl-schema";

const Likes = new Mongo.Collection("likes");

Likes.schema = new SimpleSchema({
  facebookAccountId: {
    type: String,
    index: true
  },
  entryId: {
    type: String,
    index: true
  },
  personId: {
    type: String,
    index: true
  },
  name: {
    type: String,
    index: true
  },
  type: {
    type: String,
    optional: true,
    index: true
  }
});

Likes.attachSchema(Likes.schema);

exports.Likes = Likes;
