import moment from "moment";

//Collections
import { Emails } from "/imports/api/emails/emails.js";

// Helpers
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

export const EmailsHelpers = {
  handleCreate({ userId, address, emailType, extraFields }) {
    logger.debug("Emails.handleCreate: called", {
      userId,
      address,
      emailType,
      extraFields
    });
    check(userId, String);
    check(address, String);
    check(emailType, String);
    check(extraFields, Match.Maybe(Object));

    return Emails.insert({ userId, address, emailType, extraFields });
  },

  sendVerifyEmail({ url, user }) {
    logger.debug("EmailsHelpers.verifyEmail called", { userId: user._id, url });
    check(url, String);

    user = Meteor.users.findOne(user._id);
    const email = user.emails[0].address;
    const emailType = "verifyEmail";

    const jobData = {
      userId: user._id,
      emailParams: {
        to: user.emails[0].address,
        subject: Emails.subjects[emailType],
        userId: user._id
      },
      emailType,
      dataContext: {
        ":url": url
      },
      extraParams: {
        userId: user._id
      }
    };

    return JobsHelpers.addJob({ jobType: "emails.send", jobData });
  },

  sendResetPassword({ url, user }) {
    logger.debug("EmailsHelpers.sendResetPassword called", {
      userId: user._id,
      url
    });
    check(url, String);

    user = Meteor.users.findOne(user._id);
    const email = user.emails[0].address;
    const emailType = "resetPassword";

    const jobData = {
      emailParams: {
        to: user.emails[0].address,
        subject: Emails.subjects[emailType],
        userId: user._id
      },
      emailType,
      dataContext: {
        ":url": url
      },
      extraParams: {
        userId: user._id
      }
    };

    return JobsHelpers.addJob({ jobType: "emails.send", jobData });
  }
};
