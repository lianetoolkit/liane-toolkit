import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";

Accounts.emailTemplates.siteName = Meteor.settings.public.appName;
Accounts.emailTemplates.from = `${Meteor.settings.public.appName} <${
  Meteor.settings.public.appEmail
}>`;

// http://docs.meteor.com/api/accounts-multi.html#AccountsCommon-config
Accounts.config({
  sendVerificationEmail: false
});

Accounts.onLogin(function(data) {
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
          verified: true
        }
      ];
    }
    if (Object.keys(set).length) {
      Meteor.users.update(
        {
          _id: data.user._id
        },
        {
          $set: set
        }
      );
    }
  }
});

Accounts.onCreateUser(function(options, user) {
  const userProperties = { profile: {} };

  const hasUser = !!Meteor.users.findOne();
  if (!hasUser) {
    user.roles = ["admin"];
  }
  user = _.extend(user, userProperties);

  return user;
});

ServiceConfiguration.configurations.upsert(
  { service: "facebook" },
  {
    $set: {
      appId: Meteor.settings.facebook.clientId,
      secret: Meteor.settings.facebook.clientSecret
    }
  }
);
