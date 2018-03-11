import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { AdAccounts } from "../adAccounts.js";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

const AdAccountsHelpers = {
  update({ adAccountId, token }) {
    check(adAccountId, String);
    check(token, String);
    const response = Promise.await(
      _fb.api(adAccountId, {
        fields: ["users", "account_id", "currency"],
        access_token: token
      })
    );
    return AdAccounts.upsert(
      {
        _id: response.account_id
      },
      {
        $setOnInsert: { _id: response.account_id },
        $set: { users: response.users.data, currency: response.currency }
      }
    );
  },
  removeUserByToken({ token, adAccountId }) {
    check(token, String);
    check(adAccountId, String);
    if (adAccountId.indexOf("act_") === 0) {
      adAccountId = adAccountId.replace("act_", "");
    }
    const user = UsersHelpers.getUserByToken({ token });
    let adAccount = AdAccounts.findOne(adAccountId);
    const users = adAccount.users.filter(
      u => u.id !== user.services.facebook.id
    );
    return AdAccounts.update(
      { _id: adAccount._id },
      {
        $set: {
          users
        }
      }
    );
  },
  getUsers({ adAccountId }) {
    check(adAccountId, String);
    if (adAccountId.indexOf("act_") === 0) {
      adAccountId = adAccountId.replace("act_", "");
    }
    const adAccount = AdAccounts.findOne(adAccountId);
    const adminUsers = adAccount.users.filter(user => {
      // Retrieving users with permission "2" on the adaccount
      return user.permissions.indexOf(2) !== -1;
    });
    if (adminUsers.length) {
      const ids = adminUsers.map(user => user.id);
      return Meteor.users
        .find({
          "services.facebook.id": { $in: ids }
        })
        .fetch();
    } else {
      return [];
    }
  }
};

exports.AdAccountsHelpers = AdAccountsHelpers;
