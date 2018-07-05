import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";

Meteor.publish("mapLayers.all", function() {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser && Roles.userIsInRole(currentUser, ["admin"])) {
    return MapLayers.find();
  } else {
    return this.ready();
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
})
