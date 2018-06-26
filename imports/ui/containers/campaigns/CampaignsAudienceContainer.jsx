import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import CampaignsAudience from "/imports/ui/pages/campaigns/CampaignsAudience.jsx";
import _ from "underscore";

const AudienceSubs = new SubsManager();

export default withTracker(props => {
  const geolocationsHandle = AudienceSubs.subscribe("geolocations.byCampaign", {
    campaignId: props.campaignId
  });
  const audienceCategoriesHandle = AudienceSubs.subscribe(
    "audienceCategories.byContext",
    {
      contextId: props.campaign.contextId
    }
  );

  const loading =
    !geolocationsHandle.ready() || !audienceCategoriesHandle.ready();

  const context = props.campaign.context;

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find({
        _id: { $in: [...context.geolocations, context.mainGeolocationId] }
      }).fetch()
    : null;

  const audienceCategories = audienceCategoriesHandle.ready()
    ? AudienceCategories.find({
        _id: { $in: context.audienceCategories }
      }).fetch()
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

  let audienceCategoryId = props.audienceCategoryId;

  if (!loading && !audienceCategoryId) {
    const audienceCategory = audienceCategories[0];
    if (audienceCategory) {
      audienceCategoryId = audienceCategory._id;
    }
  }

  return {
    loading,
    geolocations,
    geolocationId,
    audienceCategories,
    audienceCategoryId
  };
})(CampaignsAudience);
