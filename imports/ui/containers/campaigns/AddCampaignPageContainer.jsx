import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import { Contexts } from "/imports/api/contexts/contexts.js";
import AddCampaignPage from "/imports/ui/pages/campaigns/AddCampaignPage.jsx";

const adAccounts = new ReactiveVar([]);
let currentRoutePath = null;
let shouldCall = false;

export default createContainer(() => {
  if (currentRoutePath !== FlowRouter.current().path) {
    shouldCall = true;
    currentRoutePath = FlowRouter.current().path;
    adAccounts.set([]);
  } else {
    shouldCall = false;
  }

  const contextsHandle = Meteor.subscribe("contexts.all");
  const loading = !contextsHandle.ready();

  const contexts = contextsHandle.ready() ? Contexts.find().fetch() : [];

  if (shouldCall) {
    Meteor.call("users.getAdAccounts", null, (error, { result }) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(adAccounts.get()) !== JSON.stringify(result)) {
        adAccounts.set(result);
      }
    });
  }

  return {
    loading,
    adAccounts: adAccounts.get(),
    contexts
  };
}, AddCampaignPage);
