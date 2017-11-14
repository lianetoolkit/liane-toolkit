import SimpleSchema from "simpl-schema";

const Likes = new Mongo.Collection("likes");

Likes.schema = new SimpleSchema({
  personId: {
    type: String,
    index: true
  },
  name: {
    type: String
  },
  entryId: {
    type: String
  },
  facebookAccountId: {
    type: String
  }
});

Likes.attachSchema(Likes.schema);

exports.Likes = Likes;
