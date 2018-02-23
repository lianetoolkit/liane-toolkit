import _ from "underscore";
import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import CampaignsPage from "/imports/ui/pages/admin/campaigns/CampaignsPage.jsx";

export default createContainer(() => {
  const subsHandle = Meteor.subscribe("campaigns.all");
  const loading = !subsHandle.ready();

  const options = {
    transform: function(campaign) {
      campaign.jobs = Jobs.find({
        "data.campaignId": campaign._id,
        type: {
          $in: [
            "audiences.updateAccountAudience",
            "entries.updateAccountEntries"
          ]
        }
      }).fetch();
      campaign.accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      return campaign;
    }
  };

  const campaigns = subsHandle.ready()
    ? Campaigns.find({}, options).fetch()
    : [];

  const jobs = subsHandle.ready() ? Jobs.find().fetch() : [];

  const accounts = subsHandle.ready() ? FacebookAccounts.find().fetch() : [];

  return {
    loading,
    campaigns
  };
}, CampaignsPage);
