import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import EditAudienceCategoriesPage from "/imports/ui/pages/admin/audiences/EditAudienceCategoriesPage.jsx";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("audienceCategories.detail", {
    audienceCategoryId: props.audienceCategoryId
  });
  const loading = !subsHandle.ready();

  const audienceCategory =
    subsHandle.ready() && props.audienceCategoryId
      ? AudienceCategories.findOne()
      : null;

  return {
    loading,
    audienceCategory
  };
}, EditAudienceCategoriesPage);
