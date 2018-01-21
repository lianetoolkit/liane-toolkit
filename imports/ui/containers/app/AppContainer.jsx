import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import App from "/imports/ui/layouts/app/App.jsx";

export default createContainer(() => {
  const currentUser = Meteor.user();
  const userHandle = Meteor.subscribe("users.data");
  const loading = !userHandle.ready();

  const campaignsHandle = Meteor.subscribe("campaigns.byUser");
  const campaigns = campaignsHandle.ready() ? Campaigns.find().fetch() : null;

  return {
    currentUser,
    loading,
    campaigns,
    connected: Meteor.status().connected
  };
}, App);
