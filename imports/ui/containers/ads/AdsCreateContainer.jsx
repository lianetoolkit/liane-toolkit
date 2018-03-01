import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import AdsCreate from "/imports/ui/pages/ads/AdsCreate.jsx";

export default createContainer(props => {
  const categoriesHandle = Meteor.subscribe("audienceCategories.detail", {
    audienceCategoryId: props.audienceCategoryId
  });
  const geolocationsHandle = Meteor.subscribe("geolocations.byCampaign", {
    campaignId: props.campaignId
  });
  const loading = !categoriesHandle.ready() || !geolocationsHandle.ready();

  const audienceCategory = categoriesHandle.ready()
    ? AudienceCategories.findOne(props.audienceCategoryId)
    : [];

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  return {
    loading,
    audienceCategory,
    geolocations
  };
}, AdsCreate);
