import { Facebook, FacebookApiException } from "fb";

FB = new Facebook({
  version: "v3.3",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
});

JobsPool = {};
