import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { ReactiveVar } from "meteor/reactive-var";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { find, map } from "lodash";

import AppLayout from "../layouts/AppLayout.jsx";

const reactiveCampaignId = new ReactiveVar(false);

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

  if (campaignsHandle.ready() && campaigns.length) {
    if (ClientStorage.has("campaign")) {
      let currentCampaign = ClientStorage.get("campaign");
      if (find(campaigns, c => currentCampaign == c._id)) {
        Session.set("campaignId", currentCampaign);
        reactiveCampaignId.set(currentCampaign);
      }
    } else {
      Session.set("campaignId", campaigns[0]._id);
      reactiveCampaignId.set(campaigns[0]._id);
      ClientStorage.set("campaign", campaigns[0]._id);
    }
  }

  const campaignId = reactiveCampaignId.get();

  let campaign;
  if (campaignId) {
    const currentCampaignOptions = {
      transform: function(campaign) {
        let accountsMap = {};
        campaign.accounts.forEach(account => {
          accountsMap[account.facebookId] = account;
        });
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
  }

  return {
    user,
    connected,
    isLoggedIn,
    campaigns,
    campaignId,
    campaign,
    content: content,
    routeName: FlowRouter.getRouteName()
  };
})(AppLayout);
