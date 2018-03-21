import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AddCampaignPage from "/imports/ui/pages/campaigns/AddCampaignPage.jsx";

const AddCampaignSubs = new SubsManager();

export default withTracker(() => {
  const contextsHandle = AddCampaignSubs.subscribe("contexts.all");
  const loading = !contextsHandle.ready();

  const contexts = contextsHandle.ready() ? Contexts.find().fetch() : [];

  return {
    loading,
    contexts
  };
})(AddCampaignPage);
