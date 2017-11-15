import SimpleSchema from "simpl-schema";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const createAudienceCategory = new ValidatedMethod({
  name: "facebook.audienceCategories.create",
  validate: new SimpleSchema({
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
    }
  }).validator(),
  run({ title, spec, contexts }) {
    logger.debug("audienceCategories.create called", { title });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const insertDoc = { title, spec, contextIds };
    AudienceCategories.insert(insertDoc);
    return;

  }
});
