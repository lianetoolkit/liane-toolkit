import fs from "fs";
import path from "path";
import createEmail from "./createEmail";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

export const sendMail = async ({
  type,
  data,
  recipient,
  language,
  subject,
  body,
  tag,
}) => {
  if (!recipient && !data.user) {
    console.log("Email not sent. Missing recipient");
    return;
  }

  let emailData;
  if (!subject && !body) {
    language = language || (data.user ? data.user.userLanguage : "en");
    emailData = createEmail(type, language, data);
  }

  JobsHelpers.addJob({
    jobType: "emails.sendMail",
    jobData: {
      from: `"Liane" <${Meteor.settings.public.appEmail}>`,
      to: recipient || `"${data.user.name}" <${data.user.emails[0].address}>`,
      subject: subject || emailData.subject,
      html: body || emailData.body,
      tag: tag || "",
    },
  });
};
