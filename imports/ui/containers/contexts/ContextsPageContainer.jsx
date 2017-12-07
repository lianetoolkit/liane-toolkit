import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import ContextsPage from "/imports/ui/pages/admin/contexts/ContextsPage.jsx";

export default createContainer(() => {
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
      return context;
    }
  };

  const contexts = contextsHandle.ready()
    ? Contexts.find({}, options).fetch()
    : [];
  const campaigns = contextsHandle.ready() ? Campaigns.find().fetch() : [];
  const mainGeolocations = contextsHandle.ready() ? Geolocations.find().fetch() : [];

  return {
    loading,
    contexts,
    campaigns,
    mainGeolocations
  };
}, ContextsPage);
