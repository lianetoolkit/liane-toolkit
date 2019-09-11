import SimpleSchema from "simpl-schema";
import nodemailer from "nodemailer";
import { Feedback } from "../feedback";

// let mailTransporter;
// if (Meteor.settings.email && Meteor.settings.email.mail) {
//   const mailConfig = Meteor.settings.email.mail;
//   mailTransporter = nodemailer.createTransport({
//     host: mailConfig.host,
//     port: mailConfig.port,
//     secure: mailConfig.secure,
//     auth: {
//       user: mailConfig.username,
//       pass: mailConfig.pass
//     }
//   });
// }

export const sendFeedback = new ValidatedMethod({
  name: "feedback.new",
  validate: new SimpleSchema({
    category: {
      type: String
    },
    name: {
      type: String
    },
    email: {
      type: String
    },
    message: {
      type: String
    },
    context: {
      type: Object,
      optional: true
    },
    "context.os": {
      type: String
    },
    "context.browser": {
      type: String
    },
    "context.version": {
      type: String
    },
    "context.url": {
      type: String
    }
  }).validator(),
  run({ category, name, email, message, context }) {
    this.unblock();

    let doc = {
      category,
      name,
      email,
      message
    };

    const userId = Meteor.userId();

    if (userId) doc["userId"] = userId;
    if (context) doc["context"] = context;

    Feedback.insert(doc);
  }
});
