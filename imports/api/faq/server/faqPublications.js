import { FAQ } from "../faq";
import { Campaigns } from "/imports/api/campaigns/campaigns";

Meteor.publish("faq.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (
    Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "faq",
      permission: "view"
    })
  ) {
    return FAQ.find({ campaignId }, { sort: { lastUsedAt: -1 } });
  }
  return this.ready();
});
