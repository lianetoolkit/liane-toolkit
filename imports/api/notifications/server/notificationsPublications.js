import { Notifications } from "/imports/api/notifications/notifications.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("notifications.byUser", function() {
  const currentUser = this.userId;
  const userCampaigns = Campaigns.find({
    users: { $elemMatch: { userId: currentUser } }
  }).fetch();
  const campaignsIds = userCampaigns.map(campaign => campaign._id);
  if (currentUser) {
    return Notifications.find({
      $or: [{ userId: currentUser }, { campaignId: { $in: campaignsIds } }]
    });
  } else {
    return this.ready();
  }
});
