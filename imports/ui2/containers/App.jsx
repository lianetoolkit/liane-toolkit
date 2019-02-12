import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FlowRouter } from "meteor/kadira:flow-router";

import AppLayout from "../layouts/AppLayout.jsx";

const AppSubs = new SubsManager();

export default withTracker(({ content }) => {
  const campaignsHandle = AppSubs.subscribe("campaigns.byUser");

  const connected = Meteor.status().connected;
  const user = Meteor.user();
  const isLoggedIn = Meteor.userId() !== null;

  let campaigns = [];

  if (connected && isLoggedIn && user) {
    campaigns = campaignsHandle.ready()
      ? Campaigns.find({
          users: { $elemMatch: { userId: user._id } }
        }).fetch()
      : null;
  }

  return {
    user,
    connected,
    isLoggedIn,
    campaigns,
    content: content,
    routeName: FlowRouter.getRouteName()
  };
})(AppLayout);
