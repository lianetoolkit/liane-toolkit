import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { AdAccounts } from "../adAccounts.js";

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
        fields: ["users", "account_id"],
        access_token: token
      })
    );
    return AdAccounts.upsert(
      {
        _id: response.account_id
      },
      {
        $setOnInsert: { _id: response.account_id },
        $set: { users: response.users.data }
      }
    );
  },
  getUsers({ adAccountId }) {
    check(adAccountId, String);
    if (adAccountId.indexOf("act_") === 0) {
      adAccountId = adAccountId.replace("act_", "");
    }
    const adAccount = AdAccounts.findOne(adAccountId);
    const ids = adAccount.users.map(user => user.id);
    return Meteor.users
      .find({
        "services.facebook.id": { $in: ids }
      })
      .fetch();
  }
};

exports.AdAccountsHelpers = AdAccountsHelpers;
