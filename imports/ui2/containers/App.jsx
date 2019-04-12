import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { PeopleTags } from "/imports/api/facebook/people/people.js";
import { ReactiveVar } from "meteor/reactive-var";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { find, map } from "lodash";

import AppLayout from "../layouts/AppLayout.jsx";

const reactiveCampaignId = new ReactiveVar(false);
const ready = new ReactiveVar(false);

const AppSubs = new SubsManager();

export default withTracker(({ content }) => {
  const campaignsHandle = AppSubs.subscribe("campaigns.byUser");

  const connected = Meteor.status().connected;
  const user = Meteor.user();
  const isLoggedIn = Meteor.userId() !== null;

  let campaigns = [];

  if (connected && isLoggedIn && user) {
    campaigns = campaignsHandle.ready()
      ? Campaigns.find({
          users: { $elemMatch: { userId: user._id } }
        }).fetch()
      : [];
  }

  if (Session.get("campaignId")) {
    reactiveCampaignId.set(Session.get("campaignId"));
    ClientStorage.set("campaign", Session.get("campaignId"));
  }

  let hasCampaign = false;
  if (campaignsHandle.ready() && campaigns.length) {
    if (ClientStorage.has("campaign")) {
      hasCampaign = true;
      let currentCampaign = ClientStorage.get("campaign");
      if (find(campaigns, c => currentCampaign == c._id)) {
        Session.set("campaignId", currentCampaign);
        reactiveCampaignId.set(currentCampaign);
      } else {
        hasCampaign = false;
      }
    }

    if (!hasCampaign) {
      Session.set("campaignId", campaigns[0]._id);
      reactiveCampaignId.set(campaigns[0]._id);
      ClientStorage.set("campaign", campaigns[0]._id);
    }
  }

  const campaignId = reactiveCampaignId.get();

  let campaign;
  let tags = [];
  if (campaignId) {
    const currentCampaignOptions = {
      transform: function(campaign) {
        let accountsMap = {};
        if (campaign.accounts) {
          campaign.accounts.forEach(account => {
            accountsMap[account.facebookId] = account;
          });
        }
        if (campaign.facebookAccount) {
          accountsMap[campaign.facebookAccount.facebookId] =
            campaign.facebookAccount;
        }
        FacebookAccounts.find({
          facebookId: { $in: Object.keys(accountsMap) }
        })
          .fetch()
          .forEach(account => {
            accountsMap[account.facebookId] = {
              ...accountsMap[account.facebookId],
              ...account
            };
          });
        campaign.accounts = Object.values(accountsMap);
        campaign.tags = PeopleTags.find({
          campaignId: campaign._id
        }).fetch();
        campaign.users = Meteor.users
          .find({
            _id: { $in: map(campaign.users, "userId") }
          })
          .fetch()
          .map(user => {
            user.campaign = campaign.users.find(u => u.userId == user._id);
            return user;
          });
        return campaign;
      }
    };
    const currentCampaignHandle = AppSubs.subscribe("campaigns.detail", {
      campaignId
    });
    campaign = currentCampaignHandle.ready()
      ? Campaigns.findOne(campaignId, currentCampaignOptions)
      : null;

    const tagsHandle = AppSubs.subscribe("people.tags", {
      campaignId
    });
    tags = tagsHandle.ready() ? PeopleTags.find({ campaignId }).fetch() : [];

    ready.set(
      currentCampaignHandle.ready() &&
        campaignsHandle.ready() &&
        tagsHandle.ready()
    );
  } else {
    ready.set(campaignsHandle.ready());
  }

  return {
    user,
    connected,
    ready: ready.get(),
    isLoggedIn,
    campaigns,
    campaignId,
    campaign,
    tags,
    content: content,
    routeName: FlowRouter.getRouteName()
  };
})(AppLayout);
