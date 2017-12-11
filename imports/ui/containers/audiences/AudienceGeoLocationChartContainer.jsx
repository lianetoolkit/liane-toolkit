import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import AudienceGeoLocationChart from "/imports/ui/components/audiences/AudienceGeoLocationChart.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("audiences.byCategory.byGeolocation", {
    campaignId: props.campaignId,
    facebookAccountId: props.facebookAccountId,
    geolocationId: props.geolocationId,
    audienceCategoryId: props.audienceCategoryId
  });

  const loading = !subsHandle.ready();

  const audiences = subsHandle.ready()
    ? FacebookAudiences.find(
        {
          campaignId: props.campaignId,
          facebookAccountId: props.facebookAccountId,
          geolocationId: props.geolocationId,
          audienceCategoryId: props.audienceCategoryId
        },
        { sortBy: { createdAt: 1 } }
      ).fetch()
    : [];
  return {
    loading,
    audiences
  };
}, AudienceGeoLocationChart);
