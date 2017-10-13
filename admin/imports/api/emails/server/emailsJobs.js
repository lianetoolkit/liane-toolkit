import { Sendgrid } from "/imports/api/sendgrid/server/sendgrid.js";
import { EmailsHelpers } from "/imports/api/emails/server/emailsHelpers.js";
import { UsersEventsHelpers } from "/imports/api/users/server/usersEventsHelpers.js";

export const EmailsJobs = {
  "emails.send": {
    run({ job }) {
      const { emailParams, emailType, dataContext, extraParams } = job.data;
      check(emailParams, Object);
      check(emailType, String);
      check(dataContext, Match.Maybe(Object));
      check(extraParams, Match.Maybe(Object));

      //if Meteor.isProduction
      Sendgrid.send({
        emailParams: job.data.emailParams,
        emailType: job.data.emailType,
        dataContext: job.data.dataContext,
        extraParams: job.data.extraParams
      });

      UsersEventsHelpers.sendEmail({
        userId: job.data.extraParams.userId,
        emailType: job.data.emailType
      });

      if (job.data.emailType !== "staff") {
        const emailDoc = {
          userId: job.data.extraParams.userId,
          address: job.data.emailParams.to,
          emailType: job.data.emailType,
          extraFields: _.omit(job.data.extraParams, "userId")
        };

        EmailsHelpers.handleCreate(emailDoc);
      }

      job.done();
      return job.remove();
    },

    workerOptions: {
      concurrency: 30,
      pollInterval: 2500
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 5,
          wait: 5 * 60 * 1000
        } // 5 minutes
      };
      return options;
    }
  }
};
