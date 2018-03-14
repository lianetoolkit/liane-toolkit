import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AudiencesCharts from "/imports/ui/components/audiences/AudiencesCharts.jsx";

export default withTracker(props => {
  const subsHandle = Meteor.subscribe("audienceCategories.byContext", {
    campaignId: props.campaignId,
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
})(AudiencesCharts);
