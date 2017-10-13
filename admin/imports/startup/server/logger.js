import os from "os";

logger = require("winston");
logger.exitOnError = false;

logger.remove(logger.transports.Console);

const consoleOptions = {
  level: "debug",
  handleExceptions: true,
  humanReadableUnhandledException: true,
  prettyPrint: true,
  debugStdout: true
};

if (Meteor.settings.deployMode === "local") {
  consoleOptions.colorize = true;
}

logger.add(logger.transports.Console, consoleOptions);

const { Papertrail } = require("winston-papertrail");

let papertrailHostName = os.hostname();
if (Meteor.settings.public.deployMode !== "local") {
  if (Meteor.settings.appType === "worker") {
    papertrailHostName = "upleap-worker";
  }
  if (Meteor.settings.appType === "admin") {
    papertrailHostName = "upleap-admin";
  }
  if (Meteor.settings.appType === "app") {
    papertrailHostName = "upleap-app";
  }
}

const papertrailOptions = {
  host: "logs2.papertrailapp.com",
  port: 41956,
  program: "upleap",
  hostname: papertrailHostName,
  logFormat(level, message) {
    return `[${level}] ${message}`;
  },
  inlineMeta: true,
  colorize: true,
  handleExceptions: true,
  humanReadableUnhandledException: true
};

logger.add(Papertrail, papertrailOptions);

if (Meteor.settings.public.deployMode !== "local") {
  const { Mail } = require("winston-mail");
  const { username, password, host, admins } = Meteor.settings.email.mail;
  // console.log("logger.Mail", { username, password, host, admins, deployMode: Meteor.settings.deployMode  })
  logger.add(Mail, {
    to: admins, //The address(es) you want to send to. [required]
    from: username, //The address you want to send from. (default: winston@[server-host-name])
    host, //SMTP server hostname (default: localhost)
    // port: 587  #SMTP port (default: 587 or 25)
    username, //User for server auth
    password, //Password for server auth
    subject: `[Upleap] [${Meteor.settings.public
      .deployMode}] {{level}} {{msg}}`, //Subject for email (default: winston: {{level}} {{msg}})
    // ssl: true #Use SSL (boolean or object { key, ca, cert })
    tls: true, //Boolean (if true, use starttls)
    level: "error", //Level of messages that this transport should log.
    silent: false, //Boolean flag indicating whether to suppress output.
    handleExceptions: true,
    humanReadableUnhandledException: true
  });
}
