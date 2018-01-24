import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import CampaignsEntries from "/imports/ui/pages/campaigns/CampaignsEntries.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];

  return {
    loading,
    campaign,
    accounts
  };
}, CampaignsEntries);
