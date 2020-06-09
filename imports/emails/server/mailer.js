import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import createEmail from "./createEmail";

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

export const sendMail = async ({
  type,
  data,
  recipient,
  language,
  subject,
  body,
}) => {
  if (!recipient && !data.user) {
    console.log("Email not sent. Missing recipient");
    return;
  }

  if (!mailTransporter) {
    console.log("Email not sent. Mail transporter not available");
    return;
  }

  language = language || (data.user ? data.user.userLanguage : "en");

  let emailData;
  if (!subject && !body) {
    const emailData = createEmail(type, language, data);
  }

  // fs.writeFile(
  //   path.join(Meteor.absolutePath, "/generated-files/test.html"),
  //   emailData.body
  // );

  return await mailTransporter.sendMail({
    from: `"Liane" <${Meteor.settings.public.appEmail}>`,
    to: recipient || data.user.emails[0].address,
    subject: subject || emailData.subject,
    html: body || emailData.body,
  });
};

export default mailTransporter;
