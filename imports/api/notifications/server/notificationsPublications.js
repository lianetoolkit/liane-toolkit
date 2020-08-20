import { Notifications } from "/imports/api/notifications/notifications.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("notifications.byUser", function () {
  const currentUser = this.userId;
  if (currentUser) {
    return Notifications.find(
      { userId: currentUser },
      { sort: { createdAt: -1 } }
    );
  } else {
    return this.ready();
  }
});
