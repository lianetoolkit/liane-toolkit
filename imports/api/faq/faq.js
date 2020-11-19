import SimpleSchema from "simpl-schema";

const FAQ = new Mongo.Collection("faq");

FAQ.schema = new SimpleSchema({
  campaignId: {
    type: String,
    index: true,
  },
  question: {
    type: String,
    index: true,
  },
  answer: {
    type: String,
  },
  lastUsedAt: {
    type: Date,
    index: true,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
    },
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
    },
  },
});

FAQ.attachSchema(FAQ.schema);

exports.FAQ = FAQ;
