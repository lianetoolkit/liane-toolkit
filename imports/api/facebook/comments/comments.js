import SimpleSchema from "simpl-schema";

const Comments = new Mongo.Collection("comments");

Comments.schema = new SimpleSchema({
  _id: {
    type: String,
    label: "Facebook id"
  },
  personId: {
    type: String,
    index: true
  },
  message: {
    type: String
  },
  entryId: {
    type: String
  },
  facebookAccountId: {
    type: String
  }
});

Comments.attachSchema(Comments.schema);

exports.Comments = Comments;
