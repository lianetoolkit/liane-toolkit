import { MapFeatures } from "../mapFeatures";
import { Campaigns } from "/imports/api/campaigns/campaigns";

Meteor.publish("mapFeatures.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (
    Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "map",
      permission: "view"
    })
  ) {
    return MapFeatures.find({ campaignId }, { sort: { createdAt: -1 } });
  }
  return this.ready();
});
