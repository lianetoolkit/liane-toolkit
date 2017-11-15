import SimpleSchema from "simpl-schema";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { FacebookAudiencesHelpers } from "./audiencesHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const fetchAudience = new ValidatedMethod({
  name: "facebook.audiences.fetch",
  validate: new SimpleSchema({
    facebookAccountId: {
      type: String
    },
    title: {
      type: String
    },
    audienceCategoryId: {
      type: String
    }
  }).validator(),
  run({ facebookAccountId, title, audienceCategoryId }) {
    logger.debug("facebook.audiences.fetch called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const category = AudienceCategories.findOne(audienceCategoryId)

    const response = FacebookAccountsHelpers.fetchAudience({ facebookAccountId, spec: category.spec });

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
