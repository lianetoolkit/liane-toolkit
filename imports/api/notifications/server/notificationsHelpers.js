import { Notifications } from "../notifications.js";
import mailer, { sendMail } from "/imports/utils/server/mailer";

const NotificationsHelpers = {
  add({ userId, text, metadata, path, category, dataRef, removable }) {
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error(404, "User not found");
    }
    let insert = {
      userId
    };
    if (text) {
      inser.text = text;
    }
    if (path) {
      insert.path = path;
    }
    if (category) {
      insert.category = category;
    }
    if (dataRef) {
      insert.dataRef = dataRef;
    }
    if (metadata) {
      insert.metadata = metadata;
    }
    if (typeof removable !== "undefined") {
      insert.removable = removable;
    }
    Notifications.insert(insert);
    if (mailer) {
      sendMail({
        to: user.emails[0].address,
        subject: "[Liane] - New notification",
        body: `
          <h3>You have a new notification!</h3>
        `
      });
    }
  },
  clear({ userId, category, dataRef }) {
    Notifications.remove({ userId, category, dataRef });
  }
};

exports.NotificationsHelpers = NotificationsHelpers;
