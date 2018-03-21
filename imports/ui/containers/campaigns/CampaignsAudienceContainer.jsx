import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import CampaignsAudience from "/imports/ui/pages/campaigns/CampaignsAudience.jsx";
import _ from "underscore";

const GeolocationSubs = new SubsManager();

export default withTracker(props => {
  const geolocationsHandle = GeolocationSubs.subscribe(
    "geolocations.byCampaign",
    {
      campaignId: props.campaignId
    }
  );

  const loading = !geolocationsHandle.ready();

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : null;

  let geolocationId = props.geolocationId;

  if (!loading && !geolocationId && props.campaign.context.mainGeolocationId) {
    const geolocation = geolocations.find(
      location => props.campaign.context.mainGeolocationId == location._id
    );
    if (geolocation) {
      geolocationId = geolocation._id;
    }
  }

  return {
    loading,
    geolocations,
    geolocationId
  };
})(CampaignsAudience);
