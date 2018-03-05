import { Canvas } from "/imports/api/canvas/canvas.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("canvas.byCampaign", function({ campaignId }) {
  const currentUser = this.userId;
  if (currentUser) {
    const campaign = Campaigns.findOne(campaignId);
    if (!_.findWhere(campaign.users, { userId: currentUser })) {
      return this.ready();
    }
    return Canvas.find({
      campaignId
    });
  } else {
    return this.ready();
  }
});
