import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import MapsPage from "/imports/ui/pages/maps/MapsPage.jsx";

const MapsSubs = new SubsManager();

export default withTracker(props => {
  return {};
})(MapsPage);
