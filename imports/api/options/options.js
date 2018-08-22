import SimpleSchema from "simpl-schema";

const Options = new Mongo.Collection("options");

const availableOptions = ["privacy_policy"];

Options.schema = new SimpleSchema({
  name: {
    type: String,
    unique: true,
    allowedValues: availableOptions
  },
  value: {
    type: String,
    optional: true
  },
  private: {
    type: Boolean,
    defaultValue: false
  }
});

Options.attachSchema(Options.schema);

exports.Options = Options;
