import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { People } from "/imports/api/facebook/people/people.js";
import {
  MapLayers,
  MapLayersCategories,
  MapLayersTags
} from "/imports/api/mapLayers/mapLayers.js";
import MapsPage from "/imports/ui/pages/maps/MapsPage.jsx";

const MapsSubs = new SubsManager();

export default withTracker(props => {
  const layersHandle = MapsSubs.subscribe("mapLayers.byCampaign", {
    campaignId: props.campaignId
  });
  const categoriesHandle = MapsSubs.subscribe("mapLayers.categories");
  const tagsHandle = MapsSubs.subscribe("mapLayers.tags");
  const peopleHandle = MapsSubs.subscribe("people.map", {
    campaignId: props.campaignId
  });
  const loading =
    !layersHandle.ready() ||
    !categoriesHandle.ready() ||
    !tagsHandle.ready() ||
    !peopleHandle.ready();

  const layers =
    layersHandle.ready() && !!props.campaign.context.mapLayers
      ? MapLayers.find({
          _id: { $in: props.campaign.context.mapLayers }
        }).fetch()
      : [];
  const categories = categoriesHandle.ready()
    ? MapLayersCategories.find().fetch()
    : [];
  const tags = tagsHandle.ready() ? MapLayersTags.find().fetch() : [];
  const people = peopleHandle.ready()
    ? People.find({
        campaignId: props.campaignId,
        "location.coordinates": { $exists: true }
      }).fetch()
    : [];

  return {
    loading,
    layers,
    categories,
    people,
    tags
  };
})(MapsPage);
