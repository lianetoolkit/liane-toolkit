import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import CampaignsPage from "/imports/ui/pages/campaigns/CampaignsPage.jsx";

export default createContainer(props => {
  console.log(props);
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready() ? Campaigns.findOne() : null;

  return {
    loading,
    campaign
  };
}, CampaignsPage);
