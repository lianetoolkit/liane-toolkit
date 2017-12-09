import { Geolocations } from "/imports/api/geolocations/geolocations.js";

Meteor.publish("geolocations.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find(
      {},
      {
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
          facebook: 1,
          osm: 1
        }
      }
    );
  } else {
    return this.ready();
  }
});
