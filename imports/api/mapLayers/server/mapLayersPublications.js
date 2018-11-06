import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Contexts } from "/imports/api/contexts/contexts.js";

Meteor.publish("mapLayers.all", function() {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return MapLayers.find();
  } else {
    return this.ready();
  }
});

Meteor.publish("mapLayers.byCampaign", function({ campaignId }) {
  this.unblock();
  const userId = this.userId;
  if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
    return this.ready();
  } else {
    const campaign = Campaigns.findOne(campaignId);
    const context = Contexts.findOne(campaign.contextId);
    return MapLayers.find({
      _id: { $in: context.mapLayers }
    });
  }
});

Meteor.publish("mapLayers.detail", function({ mapLayerId }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return MapLayers.find({
      _id: mapLayerId
    });
  } else {
    return this.ready();
  }
});

Meteor.publish("mapLayers.categories", function() {
  this.unblock();
  return MapLayersCategories.find();
});

Meteor.publish("mapLayers.tags", function() {
  this.unblock();
  return MapLayersTags.find();
});
