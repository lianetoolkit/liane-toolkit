import { Notifications } from "/imports/api/notifications/notifications.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("notifications.byUser", function() {
  const currentUser = this.userId;
  let selector = {
    $or: [{ userId: currentUser }]
  };
  const userCampaigns = Campaigns.find({
    users: { $elemMatch: { userId: currentUser } }
  }).fetch();
  if (userCampaigns) {
    const campaignsIds = userCampaigns.map(campaign => campaign._id);
    selector.$or.push({ campaignId: { $in: campaignsIds } });
  }
  if (currentUser) {
    return Notifications.find(selector);
  } else {
    return this.ready();
  }
});
