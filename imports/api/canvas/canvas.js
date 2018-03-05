import SimpleSchema from "simpl-schema";

const Canvas = new Mongo.Collection("canvas");

Canvas.schema = new SimpleSchema({
  campaignId: {
    type: String
  },
  section: {
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
    type: String,
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
