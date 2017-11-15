import SimpleSchema from "simpl-schema";

const AudienceCategories = new Mongo.Collection("audience_categories");

AudienceCategories.schema = new SimpleSchema({
  title: {
    type: String
  },
  spec: {
    type: Object,
    blackbox: true
  },
  contextIds: {
    type: Array
  },
  "contextIds.$": {
    type: String
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

AudienceCategories.attachSchema(AudienceCategories.schema);

exports.AudienceCategories = AudienceCategories;
