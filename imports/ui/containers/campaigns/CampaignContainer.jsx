import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { PeopleTags } from "/imports/api/facebook/people/people.js";
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

  const peopleTagsHandle = CampaignSubs.subscribe("people.tags", {
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

  // Store campaign in Meteor Session
  if (campaign) {
    Session.set("campaign", campaign);
  }

  const tags = peopleTagsHandle.ready()
    ? PeopleTags.find({ campaignId: props.campaignId }).fetch()
    : [];

  let currentFacebookId = props.content.props.facebookId;
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

  let currentAudienceFacebookId = props.content.props.audienceFacebookId;
  if (
    !currentAudienceFacebookId &&
    campaign &&
    campaign.accounts &&
    campaign.accounts.length
  ) {
    currentAudienceFacebookId = campaign.accounts[0].facebookId;
  }

  let audienceAccount;
  if (
    currentAudienceFacebookId &&
    campaign &&
    campaign.accounts &&
    campaign.accounts.length
  ) {
    audienceAccount = campaign.accounts.find(
      acc => acc.facebookId == currentAudienceFacebookId
    );
  }

  const loading =
    !userHandle.ready() || !campaignsHandle.ready() || !campaignHandle.ready();

  return {
    currentUser,
    loading,
    campaigns,
    tags,
    currentCampaign: FlowRouter.getParam("campaignId"),
    connected: Meteor.status().connected,
    campaign,
    account,
    audienceAccount,
    currentFacebookId
  };
})(App);
