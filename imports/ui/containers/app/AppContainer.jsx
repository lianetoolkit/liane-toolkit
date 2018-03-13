import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import App from "/imports/ui/layouts/app/App.jsx";

export default withTracker(() => {
  const userHandle = Meteor.subscribe("users.data");
  const loading = !userHandle.ready();
  const currentUser = userHandle.ready() ? Meteor.user() : null;

  const campaignsHandle = Meteor.subscribe("campaigns.byUser");
  const campaigns =
    campaignsHandle.ready() && currentUser
      ? Campaigns.find({
          users: { $elemMatch: { userId: currentUser._id } }
        }).fetch()
      : null;

  return {
    currentUser,
    loading,
    campaigns,
    currentCampaign: FlowRouter.getParam("campaignId"),
    connected: Meteor.status().connected
  };
})(App);
