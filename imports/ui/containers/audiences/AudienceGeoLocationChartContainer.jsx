import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import AudienceGeoLocationChart from "/imports/ui/components/audiences/AudienceGeoLocationChart.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("audiences.byCategory.byGeolocation", {
    facebookAccountId: props.facebookAccountId,
    geoLocationId: props.geoLocationId,
    audienceCategoryId: props.audienceCategoryId
  });

  const loading = !subsHandle.ready();

  const audiences = subsHandle.ready()
    ? FacebookAudiences.find(
        {
          facebookAccountId: props.facebookAccountId,
          geoLocationId: props.geoLocationId,
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
