import { FAQ } from "../faq";
import { Campaigns } from "/imports/api/campaigns/campaigns";

Meteor.publish("faq.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (Meteor.call("campaigns.canManage", { campaignId, userId })) {
    return FAQ.find({ campaignId }, { sort: { createdAt: -1 } });
  }
  return this.ready();
});
