import { Promise } from "meteor/promise";
import _ from "underscore";

const UsersHelpers = {
  supervise({ userId }) {
    check(userId, String);
    logger.debug("UsersHelpers.supervise: called", { userId });
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
    return Promise.await(FB.api("me/permissions", { access_token }));
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
      FB.api(
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
    let result;
    try {
      response = Promise.await(
        FB.api("me/adaccounts", {
          fields: ["account_id", "users"],
          access_token: token
        })
      );
      result = response.data;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(500, "Error trying to fetch ad accounts.");
    }
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
