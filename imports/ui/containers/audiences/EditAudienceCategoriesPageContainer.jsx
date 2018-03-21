import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import EditAudienceCategoriesPage from "/imports/ui/pages/admin/audiences/EditAudienceCategoriesPage.jsx";

const EditAudienceSubs = new SubsManager();

export default withTracker(props => {
  const subsHandle = EditAudienceSubs.subscribe("audienceCategories.detail", {
    audienceCategoryId: props.audienceCategoryId
  });
  const loading = !subsHandle.ready();

  const audienceCategory =
    subsHandle.ready() && props.audienceCategoryId
      ? AudienceCategories.findOne(props.audienceCategoryId)
      : null;

  return {
    loading,
    audienceCategory
  };
})(EditAudienceCategoriesPage);
