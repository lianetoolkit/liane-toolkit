import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { MapFeatures } from "/imports/api/mapFeatures/mapFeatures";
import MapPage from "../pages/Map.jsx";

const MapSubs = new SubsManager();

export default withTracker(props => {
  const { campaignId } = props;
  const mapFeaturesHandle = MapSubs.subscribe("mapFeatures.byCampaign", {
    campaignId
  });

  const loading = !mapFeaturesHandle.ready();
  const mapFeatures = mapFeaturesHandle.ready()
    ? MapFeatures.find({ campaignId }, { sort: { createdAt: -1 } }).fetch()
    : [];

  return {
    loading,
    mapFeatures
  };
})(MapPage);
