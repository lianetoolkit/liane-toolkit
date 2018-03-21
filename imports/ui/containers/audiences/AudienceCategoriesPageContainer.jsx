import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import AudienceCategoriesPage from "/imports/ui/pages/admin/audiences/AudienceCategoriesPage.jsx";

const AudienceCategorySubs = new SubsManager();

export default withTracker(() => {
  const subsHandle = AudienceCategorySubs.subscribe("audienceCategories.all");
  const loading = !subsHandle.ready();

  const audienceCategories = subsHandle.ready()
    ? AudienceCategories.find().fetch()
    : [];

  return {
    loading,
    audienceCategories
  };
})(AudienceCategoriesPage);
