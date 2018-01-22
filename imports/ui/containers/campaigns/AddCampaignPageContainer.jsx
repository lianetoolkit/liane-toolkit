import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AddCampaignPage from "/imports/ui/pages/campaigns/AddCampaignPage.jsx";

const adAccounts = new ReactiveVar([]);

export default createContainer(() => {
  const contextsHandle = Meteor.subscribe("contexts.all");
  const loading = !contextsHandle.ready();

  const contexts = contextsHandle.ready() ? Contexts.find().fetch() : [];

  Meteor.call("users.getAdAccounts", null, (error, { result }) => {
    if (error) {
      console.warn(error);
    } else {
      console.log("call", result);
    }
    if (JSON.stringify(adAccounts.get()) !== JSON.stringify(result.data)) {
      adAccounts.set(result.data);
    }
  });

  return {
    loading,
    adAccounts: adAccounts.get(),
    contexts
  };
}, AddCampaignPage);
