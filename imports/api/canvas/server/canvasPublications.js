import { Canvas } from "/imports/api/canvas/canvas.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("canvas.byCampaign", function({ campaignId }) {
  const currentUser = this.userId;
  if (currentUser) {
    if (
      !Meteor.call("campaigns.canManage", { campaignId, userId: currentUser })
    ) {
      return this.ready();
    }
    return Canvas.find({
      campaignId
    });
  } else {
    return this.ready();
  }
});
