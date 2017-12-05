import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import AddContextsPage from "/imports/ui/pages/contexts/AddContextsPage.jsx";

export default createContainer(() => {
  const subsGeolocationsHandle = Meteor.subscribe("geolocations.all");
  const subsAudienceCategoriesHandle = Meteor.subscribe(
    "audiences.categories.all"
  );
  const loading =
    !subsGeolocationsHandle.ready() && !subsAudienceCategoriesHandle.ready();

  const geolocations = subsGeolocationsHandle.ready()
    ? Geolocations.find().fetch()
    : [];
  const audienceCategories = subsAudienceCategoriesHandle.ready()
    ? AudienceCategories.find().fetch()
    : [];

  return {
    loading,
    available: {
      geolocations,
      audienceCategories
    }
  };
}, AddContextsPage);
