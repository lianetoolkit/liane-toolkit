import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers.js";
import { languages } from "/locales";

// http://docs.meteor.com/api/accounts-multi.html#AccountsCommon-config
Accounts.config({
  sendVerificationEmail: true,
});

Accounts.onLogin(function (data) {
  if (data.user.services.facebook) {
    const facebookData = data.user.services.facebook;
    let set = {};
    if (!data.user.name) {
      set["name"] =
        facebookData.name ||
        facebookData.first_name + " " + facebookData.last_name;
    }
    if (!data.user.emails || !data.user.emails.length) {
      set["emails"] = [
        {
          address: facebookData.email,
          verified: true,
        },
      ];
    }
    if (facebookData.accessToken && !facebookData.id) {
      const debugToken = UsersHelpers.debugFBToken({
        token: facebookData.accessToken,
      });
      if (debugToken.is_valid) {
        set["services.facebook.id"] = debugToken.user_id;
      }
    }
    if (Object.keys(set).length) {
      Meteor.users.update(
        {
          _id: data.user._id,
        },
        {
          $set: set,
        }
      );
    }
  }
});

Accounts.onCreateUser(function (options, user) {
  const userProperties = { profile: {} };

  const hasUser = !!Meteor.users.findOne();
  if (!hasUser) {
    user.roles = ["admin"];
  }
  user = _.extend(user, userProperties);

  if (options.name) {
    user.name = options.name;
  }
  if (options.country) {
    user.country = options.country;
  }
  if (options.region) {
    user.region = options.region;
  }

  if (options.type) {
    user.type = options.type;
  }

  if (options.userLanguage && languages[options.userLanguage]) {
    user.userLanguage = options.userLanguage;
  }

  // Validate invitation
  if (options.invite && options.invite.split("|").length == 2) {
    const parsedInvite = options.invite.split("|");
    const campaignId = parsedInvite[1];
    const inviteId = parsedInvite[0];
    const campaign = CampaignsHelpers.getInviteCampaign({
      campaignId,
      inviteId,
    });
    if (campaign) {
      const invite = campaign.users.find((u) => u.inviteId == inviteId);
      CampaignsHelpers.applyInvitation({
        inviteId,
        campaignId,
        userId: user._id,
      });
      user.email = invite.email;
      user.type = "user";
      user.emails[0].verified = true;

      // Notify campaign owner
      NotificationsHelpers.add({
        userId: campaign.creatorId,
        metadata: {
          name: user.name,
          campaignName: campaign.name,
        },
        category: "campaignInviteAccepted",
        dataRef: campaignId,
      });
    }
  }

  return user;
});

ServiceConfiguration.configurations.upsert(
  { service: "facebook" },
  {
    $set: {
      appId: Meteor.settings.facebook.clientId,
      secret: Meteor.settings.facebook.clientSecret,
    },
  }
);
