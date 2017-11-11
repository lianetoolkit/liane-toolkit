import SimpleSchema from "simpl-schema";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const contextsCreate = new ValidatedMethod({
  name: "contexts.create",
  validate: new SimpleSchema({
    name: {
      type: String
    }
  }).validator(),
  run({ name }) {
    logger.debug("contexts.create called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = { name };
    Contexts.insert(insertDoc);
    return;
  }
});
