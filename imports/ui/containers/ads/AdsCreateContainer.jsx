import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { AdAccounts } from "/imports/api/facebook/adAccounts/adAccounts.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import AdsCreate from "/imports/ui/pages/ads/AdsCreate.jsx";

const AdsSubs = new SubsManager();

export default withTracker(props => {
  const adAccountHandle = AdsSubs.subscribe("adAccounts.byCampaign", {
    campaignId: props.campaignId
  });
  const categoriesHandle = AdsSubs.subscribe("audienceCategories.detail", {
    audienceCategoryId: props.audienceCategoryId
  });
  const geolocationsHandle = AdsSubs.subscribe("geolocations.byCampaign", {
    campaignId: props.campaignId
  });
  const loading =
    !adAccountHandle.ready() ||
    !categoriesHandle.ready() ||
    !geolocationsHandle.ready();

  const adAccount = adAccountHandle.ready() ? AdAccounts.findOne() : null;

  const audienceCategory = categoriesHandle.ready()
    ? AudienceCategories.findOne(props.audienceCategoryId)
    : [];

  const geolocations = geolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : [];

  return {
    loading,
    adAccount,
    audienceCategory,
    geolocations
  };
})(AdsCreate);
