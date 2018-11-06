import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import EditGeolocationsPage from "/imports/ui/pages/admin/geolocations/EditGeolocationsPage.jsx";

const EditGeolocationSubs = new SubsManager();

export default withTracker(props => {
  const subsHandle = EditGeolocationSubs.subscribe("geolocations.detail", {
    geolocationId: props.geolocationId
  });
  const geolocationsHandle = EditGeolocationSubs.subscribe("geolocations.all");

  const loading = !subsHandle.ready() || !geolocationsHandle.ready();

  const geolocation =
    subsHandle.ready() && props.geolocationId
      ? Geolocations.findOne(props.geolocationId)
      : null;

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  return {
    loading,
    geolocation,
    geolocations
  };
})(EditGeolocationsPage);
