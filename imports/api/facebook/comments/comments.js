import SimpleSchema from "simpl-schema";

const Comments = new Mongo.Collection("comments");

Comments.schema = new SimpleSchema({
  personId: {
    type: String,
    index: true
  },
  entryId: {
    type: String,
    index: true
  },
  facebookAccountId: {
    type: String,
    index: true
  },
  message: {
    type: String
  },
  message_tags: {
    type: Object,
    blackbox: true,
    optional: true
  },
  created_time: {
    type: Date,
    index: true
  },
  comment_count: {
    type: Number,
    optional: true
  },
  like_count: {
    type: Number,
    optional: true
  }
});

Comments.attachSchema(Comments.schema);

exports.Comments = Comments;
