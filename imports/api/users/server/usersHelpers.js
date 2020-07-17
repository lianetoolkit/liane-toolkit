import { Promise } from "meteor/promise";
import _ from "underscore";

import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

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
      permissions.data.map((permission) => {
        if (permission.status == "declined") {
          return permission.permission;
        }
      })
    );
  },
  updateFBToken({ userId, token, secret }) {
    const credential = Facebook.retrieveCredential(token, secret);
    let longToken;
    if (credential && credential.serviceData.accessToken) {
      longToken = UsersHelpers.exchangeFBToken({
        token: credential.serviceData.accessToken,
      });
      const debugToken = this.debugFBToken({ token: longToken.result });
      if (debugToken.is_valid) {
        Meteor.users.update(userId, {
          $set: {
            "services.facebook.id": debugToken.user_id,
            "services.facebook.accessToken": longToken.result,
          },
        });
      } else {
        throw new Meteor.Error(400, "Token not valid");
      }
    } else {
      throw new Meteor.Error(500, "Error retrieving Facebook credentials.");
    }
    return longToken;
  },
  debugFBToken({ token }) {
    check(token, String);
    const appToken = Promise.await(
      FB.api("oauth/access_token", {
        client_id: Meteor.settings.facebook.clientId,
        client_secret: Meteor.settings.facebook.clientSecret,
        grant_type: "client_credentials",
      })
    );
    const response = Promise.await(
      FB.api("debug_token", {
        input_token: token,
        access_token: appToken.access_token,
      })
    );
    if (response.data) {
      return response.data;
    } else {
      return false;
    }
  },
  exchangeFBToken({ token }) {
    check(token, String);
    const response = Promise.await(
      FB.api(
        "oauth/access_token",
        Object.assign(
          {
            grant_type: "fb_exchange_token",
            fb_exchange_token: token,
          },
          {
            client_id: Meteor.settings.facebook.clientId,
            client_secret: Meteor.settings.facebook.clientSecret,
          }
        )
      )
    );
    return { result: response.access_token };
  },
  getUserByToken({ token }) {
    check(token, String);
    return Meteor.users.findOne({
      "services.facebook.accessToken": token,
    });
  },
  removeUser({ userId }) {
    check(userId, String);

    if (!userId) throw new Meteor.Error(400, "Missing user id");

    const user = Meteor.users.findOne(userId);

    if (!user) throw new Meteor.Error(404, "User not found");

    // Remove user campaigns (only if its only admin)
    const userCampaigns = Campaigns.find({
      $or: [
        { creatorId: userId },
        { users: { $elemMatch: { userId, role: "admin" } } },
      ],
    }).fetch();
    for (const campaign of userCampaigns) {
      if (CampaignsHelpers.getAdminCount({ campaignId: campaign._id }) == 1)
        if (
          Meteor.call("campaigns.userCan", {
            campaignId: campaign._id,
            userId,
            feature: "admin",
          })
        ) {
          CampaignsHelpers.removeCampaign({ campaignId: campaign._id });
        }
    }

    // Remove self from campaigns
    const memberCampaigns = Campaigns.find({
      "users.userId": user._id,
    }).fetch();
    for (const campaign of memberCampaigns) {
      const campaignUser = campaign.users.find((u) => u.userId == user._id);
      Campaigns.update(
        { _id: campaign._id },
        { $pull: { users: campaignUser } }
      );
    }

    // Revoke Facebook permissions
    if (user.services.facebook) {
      try {
        Promise.await(
          FB.api(user.services.facebook.id + "/permissions", "DELETE", {
            access_token: user.services.facebook.accessToken,
          })
        );
      } catch (err) {
        console.log(err);
        console.log("error revoking facebook permissions");
      }
    }

    return Meteor.users.remove(userId);
  },
};

exports.UsersHelpers = UsersHelpers;
