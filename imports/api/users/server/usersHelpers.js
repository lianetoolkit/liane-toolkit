import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
_fb = new Facebook(options);

const UsersHelpers = {
  supervise({ userId }) {
    check(userId, String);
    logger.info("UsersHelpers.supervise: called", { userId });
    const user = Meteor.users.findOne(userId);
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      _fb.api('oauth/access_token', Object.assign({
        grant_type: 'fb_exchange_token',
        fb_exchange_token: token
      }, options))
    );
    return { result: response.access_token };
  }
};

exports.UsersHelpers = UsersHelpers;
