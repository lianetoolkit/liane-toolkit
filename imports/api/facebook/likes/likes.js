import SimpleSchema from "simpl-schema";

const Likes = new Mongo.Collection("likes");

Likes.schema = new SimpleSchema({
  facebookAccountId: {
    type: String
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
    type: String
  },
  type: {
    type: String,
    optional: true
  }
});

Likes.attachSchema(Likes.schema);

exports.Likes = Likes;
