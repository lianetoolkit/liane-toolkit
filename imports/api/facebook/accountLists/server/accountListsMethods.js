import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { AccountLists } from "/imports/api/facebook/accountLists/accountLists.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { AccountListsHelpers } from "./accountListsHelpers.js";

const schemaConfig = {
  name: {
    type: String
  },
  campaignId: {
    type: String,
    index: true
  }
};

const validateCreate = new SimpleSchema(schemaConfig).validator();
const validateUpdate = new SimpleSchema(
  Object.assign({ _id: { type: String } }, schemaConfig)
).validator();

const _authorize = ({ userId, campaignId, accountListId }) => {
  if (!campaignId && !accountListId) {
    throw new Meteor.Error(401);
  }
  if (!userId) {
    throw new Meteor.Error(401, "You need to login");
  }
  if (accountListId) {
    const accountList = AccountLists.findOne(accountListId);
    if (!accountList) {
      throw new Meteor.Error(401, "This list does not exist");
    }
    campaignId = accountList.campaignId;
  }
  const campaign = Campaigns.findOne(campaignId);
  if (!campaign) {
    throw new Meteor.Error(401, "Campaign does not exists");
  }
  allowed = _.findWhere(campaign.users, { userId });
  if (!allowed) {
    throw new Meteor.Error(401, "You are not allowed to do this action");
  }
};

export const accountListsCreate = new ValidatedMethod({
  name: "accountLists.create",
  validate: validateCreate,
  run({ name, campaignId }) {
    logger.debug("accountLists.create called", { name });

    _authorize({ userId: Meteor.userId(), campaignId });

    const insertDoc = {
      name,
      campaignId
    };

    return AccountLists.insert(insertDoc);
  }
});

export const accountListsRemove = new ValidatedMethod({
  name: "accountLists.remove",
  validate: new SimpleSchema({
    accountListId: {
      type: String
    }
  }).validator(),
  run({ accountListId }) {
    logger.debug("accountLists.remove called", { accountListId });

    _authorize({ userId: Meteor.userId(), accountListId });

    return AccountLists.remove(accountListId);
  }
});

export const accountListsUpdate = new ValidatedMethod({
  name: "accountLists.update",
  validate: validateUpdate,
  run({ _id, name }) {
    logger.debug("accountLists.update called", { name });

    _authorize({ userId: Meteor.userId(), accountListId: _id });

    Geolocations.update({ _id }, { $set: { name } });
    return;
  }
});

export const addSelfAccount = new ValidatedMethod({
  name: "accountLists.addSelfAccount",
  validate: new SimpleSchema({
    accountListId: {
      type: String
    },
    account: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ accountListId, account }) {
    logger.debug("facebook.accountLists.addSelfAccount called", {
      accountListId,
      account
    });

    const userId = Meteor.userId();

    _authorize({ userId, accountListId });

    const user = Meteor.users.findOne(userId);
    const accessToken = user.services.facebook.accessToken;

    AccountListsHelpers.addAccountToList({
      accountListId,
      account,
      accessToken
    });

    return;
  }
});

export const searchFacebookAccounts = new ValidatedMethod({
  name: "accountLists.searchFacebookAccounts",
  validate: new SimpleSchema({
    q: {
      type: String
    }
  }).validator(),
  run({ q }) {
    logger.debug("accountLists.searchFacebookAccounts called", { q });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const user = Meteor.users.findOne(userId);

    return AccountListHelpers.facebookSearch({
      type: "page",
      fields: ["description", "category", "name"],
      accessToken: user.services.facebook.accessToken,
      q
    });
  }
});
