import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import CampaignsPage from "/imports/ui/pages/campaigns/CampaignsPage.jsx";
import _ from "underscore";

export default createContainer(props => {
  console.log(props);
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready() ? Campaigns.findOne() : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];
  console.log(accounts);
  return {
    loading,
    campaign,
    accounts
  };
}, CampaignsPage);
