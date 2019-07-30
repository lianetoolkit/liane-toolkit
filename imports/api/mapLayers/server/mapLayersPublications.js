import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("mapLayers.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
    return this.ready();
  } else {
    return MapLayers.find({ campaignId });
  }
});
