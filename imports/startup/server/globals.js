import { Facebook, FacebookApiException } from "fb";

FB = new Facebook({
  version: "v7.0",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
});

JobsPool = {};

var path = Npm.require("path");
Meteor.rootPath = path.resolve(".");
Meteor.absolutePath = Meteor.rootPath.split(path.sep + ".meteor")[0];
