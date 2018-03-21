import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import EditContextsPage from "/imports/ui/pages/admin/contexts/EditContextsPage.jsx";

const EditContextSubs = new SubsManager();

export default withTracker(props => {
  const contextHandle = EditContextSubs.subscribe("admin.contexts.detail", {
    contextId: props.contextId
  });
  const geolocationsHandle = EditContextSubs.subscribe("geolocations.all");
  const audienceCategoriesHandle = EditContextSubs.subscribe(
    "audienceCategories.all"
  );

  const loading =
    !contextHandle.ready() &&
    !geolocationsHandle.ready() &&
    !audienceCategoriesHandle.ready();

  const context =
    contextHandle.ready() && props.contextId
      ? Contexts.findOne(props.contextId)
      : null;

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
})(EditContextsPage);
