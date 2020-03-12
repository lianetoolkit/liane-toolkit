import { Notifications } from "../notifications.js";

const NotificationsHelpers = {
  add({ userId, text, metadata, path, category, dataRef, removable }) {
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
  },
  clear({ userId, category, dataRef }) {
    Notifications.remove({ userId, category, dataRef });
  }
};

exports.NotificationsHelpers = NotificationsHelpers;
