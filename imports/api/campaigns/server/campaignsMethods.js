import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const contextsCreate = new ValidatedMethod({
  name: "campaigns.create",
  validate: new SimpleSchema({
    name: {
      type: String
    },
    description: {
      type: String
    },
    contextId: {
      type: String
    }
  }).validator(),
  run({ name, description, contextId }) {
    logger.debug("campaigns.create called", { name, description, contextId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    const users = [{ userId, role: "owner" }];
    const insertDoc = { users, name, description, contextId };

    campaignId = Campaigns.insert(insertDoc);
    return { result: campaignId };
  }
});
