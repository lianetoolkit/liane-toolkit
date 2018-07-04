import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { MapLayers } from "/imports/api/mapLayers/mapLayers.js";
import MapLayersPage from "/imports/ui/pages/admin/mapLayers/MapLayersPage.jsx";

const MapLayersSubs = new SubsManager();

export default withTracker(() => {
  const subsHandle = MapLayersSubs.subscribe("mapLayers.all");
  const loading = !subsHandle.ready();

  const mapLayers = subsHandle.ready() ? MapLayers.find().fetch() : [];

  return {
    loading,
    mapLayers
  };
})(MapLayersPage);
