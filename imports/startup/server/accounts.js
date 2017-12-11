import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";

Accounts.emailTemplates.siteName = Meteor.settings.public.appName;
Accounts.emailTemplates.from = `${Meteor.settings.public.appName} <${
  Meteor.settings.public.appEmail
}>`;

// http://docs.meteor.com/api/accounts-multi.html#AccountsCommon-config
Accounts.config({
  sendVerificationEmail: false
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
