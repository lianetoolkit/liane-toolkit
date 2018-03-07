import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
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

  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready()
    ? Campaigns.findOne(props.campaignId)
    : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];

  let facebookId = props.facebookId;
  if (!props.facebookId && accounts.length) {
    facebookId = accounts[0].facebookId;
  }
  if (facebookId) {
    Meteor.call(
      "people.campaignSummary",
      {
        campaignId: props.campaignId,
        facebookAccountId: facebookId
      },
      (error, data) => {
        if (error) {
          console.warn(error);
        }
        if (JSON.stringify(peopleSummary.get()) !== JSON.stringify(data)) {
          peopleSummary.set(data);
        }
      }
    );
  }

  return {
    loading,
    campaign,
    accounts,
    peopleSummary: peopleSummary.get()
  };
}, CampaignsPeople);
