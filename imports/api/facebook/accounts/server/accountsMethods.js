import SimpleSchema from "simpl-schema";
import { FacebookAccountsHelpers } from "./accountsHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
// DDPRateLimiter = require('meteor/ddp-rate-limiter').DDPRateLimiter;

export const getUserAccounts = new ValidatedMethod({
  name: "facebook.accounts.getUserAccounts",
  validate() {},
  run() {
    this.unblock();
    logger.debug("facebook.accounts.getUserAccounts called");

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }
    response = FacebookAccountsHelpers.getUserAccounts({ userId });

    return response;
  }
});

export const getAccountLikes = new ValidatedMethod({
  name: "facebook.account.likes",
  validate: new SimpleSchema({
    facebookAccountId: {
      type: String
    }
  }).validator(),
  run({ facebookAccountId }) {
    this.unblock();
    logger.debug("facebook.account.likes", { facebookAccountId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    likes = Likes.aggregate([
      { $match: { facebookAccountId: facebookAccountId } },
      { $group: { _id: "$name", counter: { $sum: 1 } } }
    ]);
    return likes;
  }
});
export const getAccountComments = new ValidatedMethod({
  name: "facebook.account.comments",
  validate: new SimpleSchema({
    facebookAccountId: {
      type: String
    }
  }).validator(),
  run({ facebookAccountId }) {
    this.unblock();
    logger.debug("facebook.account.comments", { facebookAccountId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    comments = Comments.aggregate([
      { $match: { facebookAccountId: facebookAccountId } },
      { $group: { _id: "$name", counter: { $sum: 1 } } }
    ]);
    return comments;
  }
});
