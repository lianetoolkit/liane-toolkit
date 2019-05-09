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
  can_hide: {
    type: Boolean,
    optional: true,
    index: true
  },
  can_remove: {
    type: Boolean,
    optional: true,
    index: true
  },
  can_reply_privately: {
    type: Boolean,
    optional: true,
    index: true
  },
  is_hidden: {
    type: Boolean,
    optional: true,
    index: true
  },
  is_private: {
    type: Boolean,
    optional: true,
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
  comments: {
    type: Object,
    blackbox: true,
    optional: true
  },
  like_count: {
    type: Number,
    optional: true
  },
  resolved: {
    type: Boolean,
    optional: true,
    index: true
  },
  categories: {
    type: Array,
    index: true,
    optional: true
  },
  "categories.$": {
    type: String,
    allowedValues: ["question", "vote"]
  }
});

Comments.attachSchema(Comments.schema);

Meteor.startup(() => {
  if (Meteor.isServer) {
    Comments.rawCollection().createIndex(
      { message_tags: 1 },
      { partialFilterExpression: { message_tags: { $exists: true } } }
    );
  }
});

exports.Comments = Comments;
