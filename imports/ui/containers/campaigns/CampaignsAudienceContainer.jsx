import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import CampaignsAudience from "/imports/ui/pages/campaigns/CampaignsAudience.jsx";
import _ from "underscore";

export default createContainer(props => {
  const campaignHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const geolocationsHandle = Meteor.subscribe("geolocations.byCampaign", {
    campaignId: props.campaignId
  });

  const loading = !campaignHandle.ready() && !geolocationsHandle.ready();

  const campaign = campaignHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;
  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];

  return {
    loading,
    campaign,
    geolocations,
    accounts
  };
}, CampaignsAudience);
