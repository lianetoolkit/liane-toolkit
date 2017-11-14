import SimpleSchema from "simpl-schema";

const People = new Mongo.Collection("people");

People.schema = new SimpleSchema({
  _id: {
    type: String,
    label: "facebookId"
  },
  name: {
    type: String
  }
});

People.attachSchema(People.schema);

exports.People = People;
