import SimpleSchema from "simpl-schema";

const Comments = new Mongo.Collection("comments");

Comments.schema = new SimpleSchema({
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
  },
  created_time: {
    type: Date
  }
});

Comments.attachSchema(Comments.schema);

exports.Comments = Comments;
