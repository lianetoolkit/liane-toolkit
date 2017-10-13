import { ValidatedMethod } from "meteor/mdg:validated-method";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { DDPRateLimiter } from "meteor/ddp-rate-limiter";

import { Proxies } from "../proxies.js";
import { ProxiesPackages } from "../proxiesPackages.js";
import { ProxiesHelpers } from "./proxiesHelpers.js";

new ValidatedMethod({
  name: "proxies.addPackage",
  validate: new SimpleSchema({
    packageId: {
      type: String
    },
    provider: {
      type: String
    }
  }).validator(),
  run({ packageId, provider }) {
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("You need to be logged in to update a promotion");
    }

    if (!Roles.userIsInRole(currentUserId, ["admin", "staff"])) {
      throw new Meteor.Error(
        "Permission Denied",
        "Sorry, you do no have permission to do this action"
      );
    }

    if (ProxiesPackages.findOne({ packageId })) {
      throw new Meteor.Error(
        "Permission Denied",
        "Sorry, this package already exists"
      );
    }

    const docId = ProxiesHelpers.createPackage({ packageId, provider });

    return { docId };
  }
});

new ValidatedMethod({
  name: "proxies.updatePackage",
  validate: new SimpleSchema({
    packageId: {
      type: String
    }
  }).validator(),
  run({ packageId }) {
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      throw new Meteor.Error("You need to be logged in to update a promotion");
    }

    if (!Roles.userIsInRole(currentUserId, ["admin", "staff"])) {
      throw new Meteor.Error(
        "Permission Denied",
        "Sorry, you do no have permission to do this action"
      );
    }

    const pPackage = ProxiesPackages.findOne({ packageId });
    if (!pPackage) {
      throw new Meteor.Error(
        "Permission Denied",
        "Sorry, this package does not exists"
      );
    }

    ProxiesHelpers.updatePackage({ packageId, provider: pPackage.provider });
  }
});
