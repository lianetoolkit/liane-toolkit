import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";

Accounts.emailTemplates.siteName = Meteor.settings.public.appName;
Accounts.emailTemplates.from = `${Meteor.settings.public.appName} <${Meteor
  .settings.public.appEmail}>`;

// http://docs.meteor.com/api/accounts-multi.html#AccountsCommon-config
Accounts.config({
  sendVerificationEmail: true
});

Accounts.onCreateUser(function(options, user) {
  const { code } = options.profile;
  if (code == null) {
    throw new Meteor.Error("Accounts.onCreateUser", "You need to a code");
  }

  if (code !== Meteor.settings.signUpCodes.staff) {
    throw new Meteor.Error("Accounts.onCreateUser", "Sorry, the code is wrong");
  }

  const userProperties = { profile: {} };

  user.roles = ["staff"];
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
