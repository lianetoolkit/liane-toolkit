import SimpleSchema from "simpl-schema";

const Feedback = new Mongo.Collection("feedback");

Feedback.schema = new SimpleSchema({
  userId: {
    type: String,
    optional: true,
    index: true
  },
  context: {
    type: Object,
    optional: true,
    blackbox: true
  },
  category: {
    type: String,
    index: true
  },
  name: {
    type: String
  },
  email: {
    type: String
  },
  subject: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: String,
    defaultValue: "new",
    allowedValues: ["progress", "resolved", "new"],
    optional: true,
    index: true
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      } else {
        return this.unset();
      }
    }
  }
});

Feedback.attachSchema(Feedback.schema);

exports.Feedback = Feedback;
