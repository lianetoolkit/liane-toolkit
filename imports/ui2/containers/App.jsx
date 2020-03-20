import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Notifications } from "/imports/api/notifications/notifications.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import {
  PeopleTags,
  PeopleLists,
  PeopleExports
} from "/imports/api/facebook/people/people.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { ReactiveVar } from "meteor/reactive-var";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { find, map, sortBy } from "lodash";

import AppLayout from "../layouts/AppLayout.jsx";

const reactiveCampaignId = new ReactiveVar(false);
const ready = new ReactiveVar(false);

const AppSubs = new SubsManager();

export default withTracker(props => {
  const campaignsHandle = AppSubs.subscribe("campaigns.byUser");
  const userHandle = AppSubs.subscribe("users.data");
  const notificationsHandle = AppSubs.subscribe("notifications.byUser");

  const connected = Meteor.status().connected;
  const isLoggedIn = Meteor.userId() !== null;
  const user = userHandle.ready()
    ? Meteor.users.findOne(Meteor.userId())
    : null;

  let campaigns = [];
  let notifications = [];

  if (connected && isLoggedIn && user) {
    campaigns = campaignsHandle.ready()
      ? Campaigns.find({
          users: { $elemMatch: { userId: user._id } }
        }).fetch()
      : [];

    notifications = notificationsHandle.ready()
      ? Notifications.find({}, { sort: { createdAt: -1 } }).fetch()
      : [];
  }

  // Handle invite param
  if (props.invite) {
    ClientStorage.set("invite", props.invite);
  }

  const incomingCampaignId = Session.get("campaignId");

  if (incomingCampaignId) {
    reactiveCampaignId.set(incomingCampaignId);
    ClientStorage.set("campaign", incomingCampaignId);
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
  let peopleExports = [];
  let lists = [];

  let entriesJob;
  let runningEntriesJobs = [];

  let importCount = 0;
  let exportCount = 0;
  if (campaignId) {
    const currentCampaignOptions = {
      fields: {
        name: 1,
        users: 1,
        country: 1,
        facebookAccount: 1,
        candidate: 1,
        party: 1,
        office: 1,
        creatorId: 1,
        geolocationId: 1,
        forms: 1,
        createdAt: 1
      },
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
        const users = Meteor.users
          .find({
            _id: { $in: map(campaign.users, "userId") }
          })
          .fetch()
          .map(user => {
            user.campaign = campaign.users.find(u => u.userId == user._id);
            return user;
          });
        const invitedUsers = campaign.users.filter(
          u => !u.userId && u.inviteId
        );
        campaign.users = [...users, ...invitedUsers];
        campaign.geolocation = Geolocations.findOne(campaign.geolocationId);
        return campaign;
      }
    };
    const currentCampaignHandle = AppSubs.subscribe("campaigns.detail", {
      campaignId
    });
    campaign = currentCampaignHandle.ready()
      ? Campaigns.findOne(campaignId, currentCampaignOptions)
      : null;

    if (campaign) {
      // Lists
      lists = PeopleLists.find({ campaignId }).fetch();
      // Set campaign country
      ClientStorage.set("country", campaign.country);
      // Set user permissions
      const campaignUser = campaign.users.find(u => u._id == Meteor.userId());
      ClientStorage.set("admin", campaign.creatorId == Meteor.userId());
      ClientStorage.set("permissions", campaignUser.campaign.permissions);
    }

    // Tags
    const tagsHandle = AppSubs.subscribe("people.tags", {
      campaignId
    });
    tags = tagsHandle.ready() ? PeopleTags.find({ campaignId }).fetch() : [];

    // Campaign jobs
    const jobsHandle = AppSubs.subscribe("jobs.byCampaign", { campaignId });
    if (jobsHandle.ready()) {
      entriesJob = Jobs.findOne({
        "data.campaignId": campaign._id,
        type: "entries.updateAccountEntries"
      });
      runningEntriesJobs = Jobs.find({
        "data.campaignId": campaign._id,
        type: "entries.updateEntryInteractions",
        status: { $nin: ["failed", "completed"] }
      }).fetch();
    }

    // Import job count
    const importCountHandle = AppSubs.subscribe("people.importJobCount", {
      campaignId
    });
    importCount = importCountHandle.ready()
      ? Counts.get("people.importJobCount")
      : 0;

    // Import job count
    const exportCountHandle = AppSubs.subscribe("people.exportJobCount", {
      campaignId
    });
    exportCount = exportCountHandle.ready()
      ? Counts.get("people.exportJobCount")
      : 0;

    // Exports
    const exportsHandle = AppSubs.subscribe("people.exports", { campaignId });
    peopleExports = exportsHandle.ready()
      ? PeopleExports.find({ campaignId }).fetch()
      : [];
    peopleExports = sortBy(peopleExports, item => -new Date(item.createdAt));

    ready.set(
      currentCampaignHandle.ready() &&
        campaignsHandle.ready() &&
        tagsHandle.ready()
    );
  } else {
    ready.set(campaignsHandle.ready());
  }

  const loadingCampaigns = !campaignsHandle.ready();

  // Refetch users for reactive behaviour
  Meteor.users.find().fetch();

  return {
    user,
    connected,
    ready: ready.get(),
    isLoggedIn,
    notifications,
    loadingCampaigns,
    campaigns,
    campaignId,
    campaign,
    tags,
    lists,
    entriesJob,
    runningEntriesJobs,
    importCount,
    exportCount,
    peopleExports,
    routeName: FlowRouter.getRouteName()
  };
})(AppLayout);
