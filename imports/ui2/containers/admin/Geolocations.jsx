import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations";
import GeolocationsPage from "/imports/ui2/pages/admin/Geolocations.jsx";
import { pluck } from "underscore";

const GeolocationsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: geolocation => {
      return geolocation;
    }
  };

  const geolocationsHandle = GeolocationsSubs.subscribe("geolocations.all", {
    query,
    options
  });

  const loading = !geolocationsHandle.ready();
  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find(query, options).fetch()
    : [];

  return {
    loading,
    page,
    limit,
    geolocations
  };
})(GeolocationsPage);
