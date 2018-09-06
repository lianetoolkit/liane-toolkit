import _ from "underscore";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import CampaignsPage from "/imports/ui/pages/admin/campaigns/CampaignsPage.jsx";

const CampaignSubs = new SubsManager();

export default withTracker(() => {
  const subsHandle = CampaignSubs.subscribe("campaigns.all");
  const loading = !subsHandle.ready();

  const options = {
    transform: function(campaign) {
      campaign.jobs = Jobs.find({
        "data.campaignId": campaign._id,
        type: {
          $in: [
            "audiences.updateAccountAudience",
            "entries.updateAccountEntries",
            "entries.refetchAccountEntries",
            "people.updateFBUsers"
          ]
        }
      }).fetch();
      campaign.accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      campaign.users = Meteor.users
        .find({
          _id: { $in: _.pluck(campaign.users, "userId") }
        })
        .fetch();
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
})(CampaignsPage);
