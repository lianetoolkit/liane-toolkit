import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("campaigns.detail", function({ campaignId }) {
  const currentUser = this.userId;
  if (currentUser) {
    return Campaigns.find({
      _id: campaignId,
      users: { $elemMatch: { userId: currentUser } }
    });
  } else {
    return this.ready();
  }
});
