import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import EditContextsPage from "/imports/ui/pages/admin/contexts/EditContextsPage.jsx";

export default createContainer(props => {
  const contextHandle = Meteor.subscribe("admin.contexts.detail", {
    contextId: props.contextId
  });
  const geolocationsHandle = Meteor.subscribe("geolocations.all");
  const audienceCategoriesHandle = Meteor.subscribe("audienceCategories.all");

  const loading =
    !contextHandle.ready() &&
    !geolocationsHandle.ready() &&
    !audienceCategoriesHandle.ready();

  const context =
    contextHandle.ready() && props.contextId ? Contexts.findOne() : null;

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  const audienceCategories = audienceCategoriesHandle.ready()
    ? AudienceCategories.find().fetch()
    : [];

  return {
    loading,
    context,
    available: {
      geolocations,
      audienceCategories
    }
  };
}, EditContextsPage);
