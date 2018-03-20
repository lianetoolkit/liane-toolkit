import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import ContextsPage from "/imports/ui/pages/admin/contexts/ContextsPage.jsx";

export default withTracker(() => {
  const contextsHandle = Meteor.subscribe("admin.contexts");
  const loading = !contextsHandle.ready();

  const options = {
    transform: function(context) {
      context.campaigns = Campaigns.find({
        contextId: context._id
      }).fetch();
      context.mainGeolocation = Geolocations.find({
        _id: context.mainGeolocationId
      }).fetch()[0];
      context.audienceCategories = AudienceCategories.find({
        _id: { $in: context.audienceCategories }
      }).fetch();
      return context;
    }
  };

  const contexts = contextsHandle.ready()
    ? Contexts.find({}, options).fetch()
    : [];

  const audienceCategories = contextsHandle.ready()
    ? AudienceCategories.find().fetch()
    : [];

  const geolocations = contextsHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  return {
    loading,
    contexts
  };
})(ContextsPage);
