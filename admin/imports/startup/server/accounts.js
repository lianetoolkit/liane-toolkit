import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { EmailsHelpers } from "/imports/api/emails/server/emailsHelpers.js";

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

Accounts.emailTemplates.verifyEmail.html = (user, url) =>
  EmailsHelpers.sendVerifyEmail({ user, url });

Accounts.emailTemplates.resetPassword.html = (user, url) =>
  EmailsHelpers.sendResetPassword({ user, url });
