import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import AudienceCategoriesPage from "/imports/ui/pages/admin/audiences/AudienceCategoriesPage.jsx";

export default createContainer(() => {
  const subsHandle = Meteor.subscribe("audienceCategories.all");
  const loading = !subsHandle.ready();

  const audienceCategories = subsHandle.ready()
    ? AudienceCategories.find().fetch()
    : [];

  return {
    loading,
    audienceCategories
  };
}, AudienceCategoriesPage);
