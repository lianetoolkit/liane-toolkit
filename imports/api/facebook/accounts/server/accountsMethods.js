import SimpleSchema from "simpl-schema";
import { FacebookAccountsHelpers } from "./accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const getUserAccounts = new ValidatedMethod({
  name: "facebook.accounts.getUserAccounts",
  validate() {},
  run() {
    logger.debug("facebook.accounts.getUserAccounts called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    response = FacebookAccountsHelpers.getUserAccounts({ userId });

    return response;
  }
});
