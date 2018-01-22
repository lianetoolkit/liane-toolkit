import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

const UsersHelpers = {
  supervise({ userId }) {
    check(userId, String);
    logger.info("UsersHelpers.supervise: called", { userId });
    const user = Meteor.users.findOne(userId);
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
  getUserAdAccounts({ token }) {
    check(token, String);
    const response = Promise.await(
      _fb.api("me", { fields: ["adaccounts"], access_token: token })
    );
    return { result: response.adaccounts };
  }
};

exports.UsersHelpers = UsersHelpers;
