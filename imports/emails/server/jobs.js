import nodemailer from "nodemailer";
import axios from "axios";

let mailTransporter, mailConfig;
if (Meteor.settings.email && Meteor.settings.email.mail) {
  mailConfig = Meteor.settings.email.mail;
  mailTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.username,
      pass: mailConfig.password,
    },
  });
}

const EmailsJobs = {
  "emails.sendMail": {
    run({ job }) {
      logger.debug("emails.sendMail: called");
      check(job && job.data && job.data.from, String);
      check(job && job.data && job.data.to, String);
      check(job && job.data && job.data.subject, String);
      check(job && job.data && job.data.html, String);

      if (Meteor.settings.email.mailgun) {
        const mailgun = Meteor.settings.email.mailgun;
        const requestData = {
          from: job.data.from,
          to: job.data.to,
          subject: job.data.subject,
          html: job.data.html,
        };
        if (job.data.tag) {
          requestData["o:tag"] = job.data.tag;
        }
        axios({
          method: "post",
          url: `https://api.mailgun.net/v3/${mailgun.domain}/messages`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          auth: {
            username: "api",
            password: mailgun.apiKey,
          },
          data: new URLSearchParams(requestData),
        })
          .then((res) => {
            job.done();
            return job.remove();
          })
          .catch((err) => {
            console.log(err);
            return job.fail(err);
          });
      } else {
        if (!mailTransporter) {
          return job.fail("Email not sent. Mail transporter not available");
        }

        mailTransporter
          .sendMail(job.data)
          .then(() => {
            job.done();
            return job.remove();
          })
          .catch((err) => {
            console.log(err);
            return job.fail(err);
          });
      }
    },

    workerOptions: {
      concurrency: 1,
      pollInterval: 2500,
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 10,
          wait: 5 * 60 * 1000, // 5 minutes
        },
      };
      return options;
    },
  },
};

exports.EmailsJobs = EmailsJobs;
