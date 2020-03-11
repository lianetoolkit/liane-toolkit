import { Notifications } from "../notifications.js";

const NotificationsHelpers = {
  add({ userId, text, path, category, dataRef }) {
    let insert = {
      userId,
      text,
      path
    };
    if (category) {
      insert.category = category;
    }
    if (dataRef) {
      insert.dataRef = dataRef;
    }
    console.log(insert);
    Notifications.insert(insert);
  },
  clear({ userId, category, dataRef }) {
    Notifications.remove({ userId, category, dataRef });
  }
};

exports.NotificationsHelpers = NotificationsHelpers;
