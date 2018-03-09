import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import CampaignsAudience from "/imports/ui/pages/campaigns/CampaignsAudience.jsx";
import _ from "underscore";

export default createContainer(props => {
  const geolocationsHandle = Meteor.subscribe("geolocations.byCampaign", {
    campaignId: props.campaignId
  });

  const loading = !geolocationsHandle.ready();

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : null;

  return {
    loading,
    geolocations
  };
}, CampaignsAudience);
