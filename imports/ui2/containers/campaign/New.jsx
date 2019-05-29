import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import NewCampaignPage from "/imports/ui2/pages/campaign/New.jsx";

const NewCampaignSubs = new SubsManager();

export default withTracker(() => {
  const contextsHandle = NewCampaignSubs.subscribe("contexts.all");
  const loading = !contextsHandle.ready();

  const contexts = contextsHandle.ready() ? Contexts.find().fetch() : [];

  return {
    loading,
    contexts
  };
})(NewCampaignPage);
