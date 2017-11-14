import SimpleSchema from "simpl-schema";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { FacebookAudiencesHelpers } from "./audiencesHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const fetchAudience = new ValidatedMethod({
  name: "facebook.audiences.fetch",
  validate: new SimpleSchema({
    accountId: {
      type: String
    },
    title: {
      type: String
    },
    spec: {
      type: Object
    }
  }).validator(),
  run({ accountId, title, spec }) {
    logger.debug("facebook.audiences.fetch called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    response = FacebookAccountsHelpers.fetchAudience({ accountId, spec });

    console.log(response);

    audienceId = FacebookAudiences.insert({
      title,
      spec,
      accountId,
      ...response
    });

    return response;
  }
});
