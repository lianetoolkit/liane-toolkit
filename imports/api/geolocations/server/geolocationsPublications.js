import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

Meteor.publish("geolocations.all", function({ query, options }) {
  this.unblock();
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find(
      query || {},
      options || {
        fields: {
          name: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});

Meteor.publish("geolocations.detail", function({ geolocationId }) {
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find(
      {
        _id: geolocationId
      },
      {
        fields: {
          name: 1,
          type: 1,
          facebook: 1,
          osm: 1,
          center: 1,
          parentId: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});
