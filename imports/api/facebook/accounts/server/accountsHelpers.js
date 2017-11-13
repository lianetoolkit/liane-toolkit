import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import _ from "underscore";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
_fb = new Facebook(options);

_fetchFacebookPageData = ({ url }) => {};

const FacebookAccountsHelpers = {
  getUserAccounts({ userId }) {
    check(userId, String);

    logger.info("FacebookAccountsHelpers.getUserAccounts: called", { userId });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      return { error: "This user does not exists" };
    }
    if (!user.services.facebook) {
      return { error: "This user has not accessToken" };
    }

    const accessToken = user.services.facebook.accessToken;
    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api("me/", { fields: ["id", "accounts"] })
    );

    return { result: response.accounts.data };
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      _fb.api(
        "oauth/access_token",
        Object.assign(
          {
            grant_type: "fb_exchange_token",
            fb_exchange_token: token
          },
          options
        )
      )
    );
    return { result: response.access_token };
  },

  getAccountEntries({ facebookId, accessToken }) {
    check(facebookId, String);
    check(accessToken, String);

    logger.debug("FacebookAccountsHelpers.getAccountEntries called", {
      facebookId
    });

    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api("me/feed", {
        fields: [
          "object_id",
          "parent_id",
          "message",
          "link",
          "type",
          "created_time",
          "updated_time"
        ],
        limit: 100
      })
    );
    logger.debug("FacebookAccountsHelpers.getAccountEntries response", {
      response
    });

    if (response.data.length) {
      let bulk = Entries.rawCollection().initializeUnorderedBulkOp();

      for (const entry of response.data) {
        entry.facebookAccountId = facebookId;
        bulk.insert(entry);
      }

      bulk.execute(function(e, result) {
        // do something with result
        console.info("result", result);
      });
    }

    return;
  }
};

exports.FacebookAccountsHelpers = FacebookAccountsHelpers;
