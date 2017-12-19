import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { AccountLists } from "/imports/api/facebook/accountLists/accountLists.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import CampaignsPage from "/imports/ui/pages/campaigns/CampaignsPage.jsx";
import _ from "underscore";

export default createContainer(props => {
  const subsHandle = Meteor.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });
  const jobsHandle = Meteor.subscribe("admin.jobs", {
    search: {
      "data.campaignId": props.campaignId,
      type: {
        $in: ["audiences.updateAccountAudience", "entries.updateAccountEntries"]
      }
    }
  });
  const loading = !subsHandle.ready();

  const campaign = subsHandle.ready() ? Campaigns.findOne() : null;
  const accounts = campaign
    ? FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch()
    : [];
  const accountLists = campaign
    ? AccountLists.find({ campaignId: campaign._id }).fetch()
    : [];
  const jobs = jobsHandle.ready()
    ? Jobs.find({
        "data.campaignId": props.campaignId,
        type: {
          $in: [
            "audiences.updateAccountAudience",
            "entries.updateAccountEntries"
          ]
        }
      }).fetch()
    : [];
  return {
    loading,
    facebookId: props.facebookId || null,
    campaign,
    accounts,
    accountLists,
    jobs
  };
}, CampaignsPage);
