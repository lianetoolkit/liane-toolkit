import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AddAudienceCategoriesPage from "/imports/ui/pages/audiences/AddAudienceCategoriesPage.jsx";

export default createContainer(() => {
  const contextsHandle = Meteor.subscribe("contexts.all");
  const loading = !contextsHandle.ready();

  const contexts = contextsHandle.ready() ? Contexts.find().fetch() : [];

  return {
    loading,
    contexts
  };
}, AddAudienceCategoriesPage);
