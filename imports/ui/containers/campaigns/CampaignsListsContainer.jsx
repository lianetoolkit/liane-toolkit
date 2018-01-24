import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import CampaignsLists from "/imports/ui/pages/campaigns/CampaignsLists.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;

  return {
    loading,
    campaign
  };
}, CampaignsLists);
