import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import CampaignsList from "/imports/ui/components/campaigns/CampaignsList.jsx";

export default createContainer(props => {
  const currentUser = Meteor.user();
  const userHandle = Meteor.subscribe("users.data");
  const subsHandle = Meteor.subscribe("campaigns.byUser");

  const loading = !subsHandle.ready() || !userHandle.ready();

  const campaigns = subsHandle.ready() ? Campaigns.find().fetch() : null;

  return {
    loading,
    currentUser,
    campaigns
  };
}, CampaignsList);
