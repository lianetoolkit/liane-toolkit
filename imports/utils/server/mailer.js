import nodemailer from "nodemailer";

let mailTransporter, mailConfig;
if (Meteor.settings.email && Meteor.settings.email.mail) {
  mailConfig = Meteor.settings.email.mail;
  mailTransporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: mailConfig.secure,
    auth: {
      user: mailConfig.username,
      pass: mailConfig.password
    }
  });
}

export const sendMail = async ({ to, subject, body }) => {
  if (!to) throw new Meteor.Error(400, "Missing recipient");

  if (!body) throw new Meteor.Error(400, "Missing content");

  if (!mailTransporter)
    throw new Meteor.Error(500, "Mail transporter not available");

  return await mailTransporter.sendMail({
    to,
    subject,
    from: `"Liane" <${Meteor.settings.email.mail.username}>`,
    html: `
      <div style="width:100%;background-color:#f0f0f0;padding-top:40px;padding-bottom:40px;">
        <div style="max-width:480px;margin:0 auto;background-color:#fff;padding:20px;">
          ${body}
        </div>
      </div>`
  });
};

export default mailTransporter;
