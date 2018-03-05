import SimpleSchema from "simpl-schema";

const Canvas = new Mongo.Collection("canvas");

Canvas.schema = new SimpleSchema({
  campaignId: {
    type: String
  },
  sectionKey: {
    type: String
  },
  parentKey: {
    type: String,
    optional: true
  },
  key: {
    type: String
  },
  value: {
    type: Match.OneOf(
      String,
      { type: Object, blackbox: true },
      { type: Array, blackbox: true }
    ),
    optional: true
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

Canvas.attachSchema(Canvas.schema);

exports.Canvas = Canvas;
