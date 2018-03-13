import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import _ from "underscore";

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
  getFacebookPermissions({ userId }) {
    check(userId, String);
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }
    if (!user.services.facebook) {
      throw new Meteor.Error(503, "Not connected to Facebook");
    }
    const access_token = user.services.facebook.accessToken;
    return Promise.await(_fb.api("me/permissions", { access_token }));
  },
  getFacebookDeclinedPermissions({ userId }) {
    check(userId, String);
    const permissions = this.getFacebookPermissions({ userId });
    return _.compact(
      permissions.data.map(permission => {
        if (permission.status == "declined") {
          return permission.permission;
        }
      })
    );
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
    let response = Promise.await(
      _fb.api("me/adaccounts", {
        fields: ["account_id", "users"],
        access_token: token
      })
    );
    // Filter admin accounts only
    const user = this.getUserByToken({ token });
    const result = response.data.filter(adAccount => {
      // return adAccount.users.data.find(u => {
      //   return (
      //     u.id == user.services.facebook.id && u.permissions.indexOf(1) !== -1
      //   );
      // });
      return true;
    });
    return { result };
  },
  getUserByToken({ token }) {
    check(token, String);
    return Meteor.users.findOne({
      "services.facebook.accessToken": token
    });
  }
};

exports.UsersHelpers = UsersHelpers;
