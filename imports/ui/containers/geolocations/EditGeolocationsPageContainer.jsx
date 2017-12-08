import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import EditGeolocationsPage from "/imports/ui/pages/admin/geolocations/EditGeolocationsPage.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("geolocations.detail", {
    geolocationId: props.geolocationId
  });
  const loading = !subsHandle.ready();

  const geolocation =
    subsHandle.ready() && props.geolocationId
      ? Geolocations.findOne()
      : null;

  return {
    loading,
    geolocation
  };
}, EditGeolocationsPage);
