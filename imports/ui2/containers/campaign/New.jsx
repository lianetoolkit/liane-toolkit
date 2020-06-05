import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { withTracker } from "meteor/react-meteor-data";
import NewCampaignPage from "/imports/ui2/pages/campaign/New.jsx";

const NewCampaignSubs = new SubsManager();

export default withTracker(() => {
  return {};
})(NewCampaignPage);
