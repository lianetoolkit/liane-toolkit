import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import CampaignsPeople from "/imports/ui/pages/campaigns/CampaignsPeople.jsx";

const peopleSummary = new ReactiveVar(null);
let currentRoutePath = null;
let shouldCall = false;

export default createContainer(props => {
  if (currentRoutePath !== FlowRouter.current().path) {
    shouldCall = true;
    currentRoutePath = FlowRouter.current().path;
    peopleSummary.set(null);
  } else {
    shouldCall = false;
  }

  // if (facebookId) {
    // Meteor.call(
    //   "people.campaignSummary",
    //   {
    //     campaignId: props.campaignId,
    //     facebookAccountId: facebookId
    //   },
    //   (error, data) => {
    //     if (error) {
    //       console.warn(error);
    //     }
    //     if (JSON.stringify(peopleSummary.get()) !== JSON.stringify(data)) {
    //       peopleSummary.set(data);
    //     }
    //   }
    // );
  // }

  return {
    peopleSummary: peopleSummary.get()
  };
}, CampaignsPeople);
