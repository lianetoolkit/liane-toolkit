import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { MapFeatures } from "/imports/api/mapFeatures/mapFeatures";
import { MapLayers } from "/imports/api/mapLayers/mapLayers";
import { People } from "/imports/api/facebook/people/people";
import MapPage from "../pages/Map.jsx";
import { uniq } from "lodash";

const MapSubs = new SubsManager();

export default withTracker(props => {
  const { campaignId } = props;
  const mapFeaturesHandle = MapSubs.subscribe("mapFeatures.byCampaign", {
    campaignId
  });
  const mapLayersHandle = MapSubs.subscribe("mapLayers.byCampaign", {
    campaignId
  });
  const peopleHandle = MapSubs.subscribe("people.map", { campaignId });

  const loading = !mapFeaturesHandle.ready() || !peopleHandle.ready();

  const mapFeatures = mapFeaturesHandle.ready()
    ? MapFeatures.find({ campaignId }).fetch()
    : [];

  const layersIds = uniq(mapFeatures.map(f => f.mapLayerId));

  const mapLayers = mapLayersHandle.ready()
    ? MapLayers.find({ campaignId, _id: { $in: layersIds } }).fetch()
    : [];

  const people = peopleHandle.ready()
    ? People.find({
        campaignId,
        "location.coordinates": { $exists: true }
      }).fetch()
    : [];

  return {
    loading,
    mapFeatures,
    mapLayers,
    people
  };
})(MapPage);
