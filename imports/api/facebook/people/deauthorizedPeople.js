import SimpleSchema from "simpl-schema";

const DeauthorizedPeople = new Mongo.Collection("deauthorized_people");

DeauthorizedPeople.schema = new SimpleSchema({
  facebookId: {
    type: String,
    index: true
  },
  campaignId: {
    type: String,
    index: true,
    optional: true
  }
});

DeauthorizedPeople.attachSchema(DeauthorizedPeople.schema);

exports.DeauthorizedPeople = DeauthorizedPeople;
