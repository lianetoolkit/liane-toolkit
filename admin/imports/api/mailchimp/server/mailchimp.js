/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const crypto = Npm.require("crypto");

const apiKey = Meteor.settings.email.mailChimp.apiKey || null;
const listId = Meteor.settings.email.mailChimp.listId || null;

const MailChimp = {
  updateUser({ userId }) {
    check(userId, String);

    logger.debug("MailChimp.updateUser called", { userId });

    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(
        "mailChimp.updateUser.error.userNotFound",
        "No User found"
      );
    }

    const userMail = user.emails[0].address;
    const { username } = user.profile;
    const role = user.roles != null ? user.roles[0] : undefined;

    const server = apiKey.split("-")[1];

    const user_vars = {
      FNAME: username,
      ROLE: role,
      ACCOUNTS: user.accountsNumber
    };

    const requestData = {
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        email_address: userMail,
        status: "subscribed",
        merge_fields: user_vars
      },
      auth: `anystring:${apiKey}`
    };

    const md5 = crypto
      .createHash("md5")
      .update(userMail)
      .digest("hex");
    const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members/${md5}`;

    return HTTP.call("PUT", url, requestData, function(error, res) {
      if (error != null) {
        logger.debug("MailChimp.updateUser: error", { userMail, error });
      }
      return res;
    });
  },

  updateMailsToSegment({ name, emails }) {
    check(name, String);
    check(emails, [String]);

    logger.info("MailChimp.addEmailsToSegment called", { name });

    const server = apiKey.split("-")[1];

    const requestData = {
      headers: {
        "Content-Type": "application/json"
      },
      data: {
        name: name,
        static_segment: emails
      },
      auth: `anystring:${apiKey}`
    };

    const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/segments/`;

    return HTTP.call("POST", url, requestData, function(error, res) {
      if (error != null) {
        logger.warn("MailChimp.addEmailsToSegment: error", { name, error });
      } else {
        logger.info("MailChimp.addEmailsToSegment", { name, response: res });
      }
      return res;
    });
  }
};

exports.MailChimp = MailChimp;
