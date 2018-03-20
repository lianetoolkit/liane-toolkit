import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import App from "/imports/ui/layouts/app/App.jsx";

const CampaignSubs = new SubsManager();

export default withTracker(props => {
  const currentUser = Meteor.user();
  const userHandle = CampaignSubs.subscribe("users.data");

  const campaignsHandle = CampaignSubs.subscribe("campaigns.byUser");
  const campaigns =
    campaignsHandle.ready() && currentUser
      ? Campaigns.find({
          users: { $elemMatch: { userId: currentUser._id } }
        }).fetch()
      : null;

  const campaignHandle = CampaignSubs.subscribe("campaigns.detail", {
    campaignId: props.campaignId
  });

  const campaignOptions = {
    transform: function(campaign) {
      campaign.accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      campaign.users = Meteor.users
        .find({
          _id: { $in: _.pluck(campaign.users, "userId") }
        })
        .fetch()
        .map(user => {
          user.campaign = campaign.users.find(u => u.userId == user._id);
          return user;
        });
      campaign.context = Contexts.findOne(campaign.contextId);
      return campaign;
    }
  };
  const campaign = campaignHandle.ready()
    ? Campaigns.findOne(props.campaignId, campaignOptions)
    : null;

  let currentFacebookId = FlowRouter.getParam("facebookId");
  if (
    !currentFacebookId &&
    campaign &&
    campaign.accounts &&
    campaign.accounts.length
  ) {
    currentFacebookId = campaign.accounts[0].facebookId;
  }

  let account;
  if (currentFacebookId && campaign && campaign.accounts.length) {
    account = campaign.accounts.find(
      acc => acc.facebookId == currentFacebookId
    );
  }

  const loading =
    !userHandle.ready() || !campaignsHandle.ready() || !campaignHandle.ready();

  return {
    currentUser,
    loading,
    campaigns,
    currentCampaign: FlowRouter.getParam("campaignId"),
    connected: Meteor.status().connected,
    campaign,
    account,
    currentFacebookId
  };
})(App);
