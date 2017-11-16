import { Geolocations } from "/imports/api/geolocations/geolocations.js";

Meteor.publish("geolocations.all", function() {
  const currentUser = this.userId;
  if (currentUser) {
    return Geolocations.find({});
  } else {
    return this.ready();
  }
});
