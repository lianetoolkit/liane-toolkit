import os from "os";
import winston from "winston";

const { deployMode } = Meteor.settings.public;

logger = winston.createLogger({
  level: deployMode == "local" ? "debug" : "info",
  format: winston.format.simple(),
  handleExceptions: true,
  exitOnError: false,
  humanReadableUnhandledException: true,
  debugStdout: true,
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      json: true,
    }),
    // new winston.winston.transports.File({ filename: "combined.log" }),
  ],
  exceptionHandlers: [new winston.transports.Console()],
});
