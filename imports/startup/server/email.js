import createEmail from "/imports/emails/server/createEmail";

const settings = Meteor.settings.email;

if (settings && settings.mail) {
  let protocol = "smtp";
  if (settings.mail.secure) protocol += "s";
  let port = settings.mail.port || 587;
  process.env.MAIL_URL = `${protocol}://${encodeURIComponent(
    settings.mail.username
  )}:${encodeURIComponent(settings.mail.password)}@${
    settings.mail.host
  }:${port}`;
}

createEmail("notification", "pt")
  .then(content => {
    console.log(content);
  })
  .catch(err => {
    console.log(err);
  });
