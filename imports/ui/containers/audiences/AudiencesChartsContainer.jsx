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

  const context = Contexts.findOne(props.contextId);
  const audienceCategories = subsHandle.ready()
    ? AudienceCategories.find({
        _id: { $in: context.audienceCategories }
      }).fetch()
    : [];
  return {
    loading,
    audienceCategories,
    context
  };
}, AudiencesCharts);
