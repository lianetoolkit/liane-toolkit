import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import EditGeolocationsPage from "/imports/ui/pages/admin/geolocations/EditGeolocationsPage.jsx";

export default withTracker(props => {
  const subsHandle = Meteor.subscribe("geolocations.detail", {
    geolocationId: props.geolocationId
  });

  const loading = !subsHandle.ready();

  const geolocation = subsHandle.ready() && props.geolocationId
    ? Geolocations.findOne(props.geolocationId)
    : null;

  return {
    loading,
    geolocation
  };
})(EditGeolocationsPage);
