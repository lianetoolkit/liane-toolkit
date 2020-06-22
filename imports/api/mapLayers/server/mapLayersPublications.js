import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("mapLayers.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (
    !Meteor.call("campaigns.userCan", {
      campaignId,
      userId,
      feature: "map",
      permission: "view"
    })
  ) {
    return this.ready();
  } else {
    return MapLayers.find({ campaignId });
  }
});
