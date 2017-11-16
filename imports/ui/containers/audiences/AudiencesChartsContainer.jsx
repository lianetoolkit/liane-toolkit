import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AudiencesCharts from "/imports/ui/components/audiences/AudiencesCharts.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("audiences.categories.byContext", {
    contextId: props.contextId
  });
  const loading = !subsHandle.ready();

  const audiencesCategories = subsHandle.ready()
    ? AudienceCategories.find({
        contextIds: { $in: [props.contextId] }
      }).fetch()
    : [];
  const context = Contexts.findOne(props.contextId);
  return {
    loading,
    audiencesCategories,
    context
  };
}, AudiencesCharts);
