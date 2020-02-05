import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns";
import { Jobs } from "/imports/api/jobs/jobs";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts";
import CampaignsPage from "/imports/ui2/pages/admin/Campaigns.jsx";
import { pluck } from "underscore";

const CampaignsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { createdAt: -1 },
    limit,
    skip,
    transform: campaign => {
      campaign.jobs = Jobs.find({
        "data.campaignId": campaign._id,
        type: {
          $in: [
            "campaigns.healthCheck",
            "entries.updateAccountEntries",
            "entries.refetchAccountEntries",
            "people.updateFBUsers"
          ]
        }
      }).fetch();
      campaign.users = Meteor.users
        .find({
          _id: { $in: pluck(campaign.users, "userId") }
        })
        .fetch();
      campaign.accounts = FacebookAccounts.find({
        facebookId: campaign.facebookAccount.facebookId
      }).fetch();
      return campaign;
    }
  };

  const campaignsHandle = CampaignsSubs.subscribe("campaigns.all", {
    query,
    options
  });

  const loading = !campaignsHandle.ready();
  const campaigns = campaignsHandle.ready()
    ? Campaigns.find(query, options).fetch()
    : [];

  // Fetch jobs for reactive behavior
  const jobs = Jobs.find().fetch();

  return {
    loading,
    page,
    limit,
    campaigns
  };
})(CampaignsPage);
