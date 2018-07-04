import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { MapLayers } from "/imports/api/mapLayers/mapLayers.js";
import EditMapLayersPage from "/imports/ui/pages/admin/mapLayers/EditMapLayersPage.jsx";

const EditMapLayersSubs = new SubsManager();

export default withTracker(props => {
  const subsHandle = EditMapLayersSubs.subscribe("mapLayers.detail", {
    mapLayerId: props.mapLayerId
  });

  const loading = !subsHandle.ready();

  const mapLayer = subsHandle.ready() && props.mapLayerId
    ? MapLayers.findOne(props.mapLayerId)
    : null;

  return {
    loading,
    mapLayer
  };
})(EditMapLayersPage);
