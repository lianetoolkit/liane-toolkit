import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Notifications } from "/imports/api/notifications/notifications.js";
import { NotificationsHelpers } from "./notificationsHelpers.js";

export const readNotification = new ValidatedMethod({
  name: "notifications.read",
  validate: new SimpleSchema({
    notificationId: {
      type: String
    }
  }).validator(),
  run({ notificationId }) {
    logger.debug("notifications.read", { notificationId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const notification = Notifications.findOne({ userId, _id: notificationId });

    if (!notification) {
      throw new Meteor.Error(404, "Not found");
    }

    return Notifications.update(
      { _id: notificationId },
      { $set: { read: true } }
    );
  }
});
