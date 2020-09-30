import { Promise } from "meteor/promise";
import { Campaigns, Invites } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import {
  People,
  PeopleTags,
  PeopleLists,
  PeopleExports,
} from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "/imports/api/facebook/people/server/peopleHelpers.js";
import { MapFeatures } from "/imports/api/mapFeatures/mapFeatures";
import { FAQ } from "/imports/api/faq/faq.js";
import { Notifications } from "/imports/api/notifications/notifications.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import _ from "underscore";

const YEEKO = Meteor.settings.yeeko;

const CampaignsHelpers = {
  getAdminCount({ campaignId }) {
    return this.getAdmins({ campaignId }).length;
  },
  getAdmins({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign || !campaign.users)
      throw new Meteor.Error(400, "Campaign not found");
    let admins = campaign.users.filter((u) => u.role == "admin");
    const creator = campaign.users.find((u) => u.userId == campaign.creatorId);
    if (creator && !creator.role) {
      admins.push(creator);
    }
    return admins;
  },
  refreshCampaignAccountToken({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const account = campaign.facebookAccount;
    if (!account.userFacebookId)
      throw new Meteor.Error(404, "Account owner not found");
    const campaignUser = Meteor.users.findOne({
      "services.facebook.id": account.userFacebookId,
    });
    if (!campaignUser) {
      throw new Meteor.Error(404, "Account owner not found");
    }
    let token = false;
    try {
      userAccounts = FacebookAccountsHelpers.getUserAccounts({
        userId: campaignUser._id,
      });
    } catch (e) {
      console.log(e);
      throw new Meteor.Error(500, "Error fetching user accounts");
    }
    if (userAccounts && userAccounts.result && userAccounts.result.length) {
      userAccounts.result.forEach((acc) => {
        if (acc.id == account.facebookId) {
          const tokenDebug = UsersHelpers.debugFBToken({
            token: acc.access_token,
          });
          if (tokenDebug && tokenDebug.is_valid) {
            token = acc.access_token;
          }
        }
      });
    }
    if (!token) {
      throw new Meteor.Error(500, "Unable to retrieve token");
    }
    const longToken = FacebookAccountsHelpers.exchangeFBToken({ token });
    Campaigns.update(
      {
        _id: campaignId,
      },
      {
        $set: {
          "facebookAccount.accessToken": longToken.result,
        },
      }
    );
  },
  disconnectAccount({ campaignId }) {
    if (!campaignId) {
      throw new Meteor.Error(400, "Campaign ID is required");
    }
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }
    const appToken = Promise.await(
      FB.api("oauth/access_token", {
        client_id: Meteor.settings.facebook.clientId,
        client_secret: Meteor.settings.facebook.clientSecret,
        grant_type: "client_credentials",
      })
    );
    try {
      Promise.await(
        FB.api(
          `${campaign.facebookAccount.facebookId}/subscribed_apps`,
          "delete",
          {
            access_token: appToken.access_token,
          }
        )
      );
    } catch (err) {}
    Campaigns.update(campaignId, {
      $set: {
        "facebookAccount.accessToken": "invalid",
      },
    });
    return;
  },
  setMainAccount({ user, campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    const upsertObj = {
      $set: {
        name: account.name,
        category: account.category,
        fanCount: account.fan_count,
      },
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);

    const token = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token,
    });

    const updateObj = {
      userFacebookId: user.services.facebook.id,
      facebookId: account.id,
      accessToken: token.result,
    };

    // Facebook subscription
    FacebookAccountsHelpers.updateFBSubscription({
      facebookAccountId: account.id,
      token: token.result,
    });

    FacebookAccountsHelpers.updateInstagramBusinessAccountId({
      facebookId: account.id,
      token: token.result,
    });

    Campaigns.update(
      { _id: campaignId },
      { $set: { facebookAccount: updateObj } }
    );

    JobsHelpers.addJob({
      jobType: "entries.updateAccountEntries",
      jobData: {
        campaignId,
        facebookId: account.id,
        accessToken: token.result,
      },
    });

    JobsHelpers.addJob({
      jobType: "campaigns.healthCheck",
      jobData: {
        campaignId,
      },
    });

    JobsHelpers.addJob({
      jobType: "people.updateFBUsers",
      jobData: {
        campaignId,
        facebookAccountId: account.id,
      },
    });
    return;
  },
  addAccount({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    const upsertObj = {
      $set: {
        name: account.name,
        category: account.category,
        fanCount: account.fan_count,
      },
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);

    const token = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token,
    });

    const updateObj = {
      facebookId: account.id,
      accessToken: token.result,
    };

    // Facebook subscription
    FacebookAccountsHelpers.updateFBSubscription({
      facebookAccountId: account.id,
      token: token.result,
    });

    FacebookAccountsHelpers.updateInstagramBusinessAccountId({
      facebookId: account.id,
      token: token.result,
    });

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { accounts: updateObj } }
    );

    JobsHelpers.addJob({
      jobType: "entries.updateAccountEntries",
      jobData: {
        campaignId,
        facebookId: account.id,
        accessToken: token.result,
      },
    });
    JobsHelpers.addJob({
      jobType: "people.updateFBUsers",
      jobData: {
        campaignId,
        facebookAccountId: account.id,
      },
    });
    return;
  },
  removeAccount({ campaignId, facebookId }) {
    check(campaignId, String);
    check(facebookId, String);

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    let account;
    if (campaign.accounts && campaign.accounts.length) {
      account = campaign.accounts.find((acc) => acc.facebookId == facebookId);
    }

    // Remove entry jobs
    Jobs.remove({
      $or: [
        { "data.facebookId": facebookId },
        { "data.facebookAccountId": facebookId },
      ],
      "data.campaignId": campaignId,
    });

    if (account) {
      Campaigns.update({ _id: campaignId }, { $pull: { accounts: account } });
    }
    return;
  },
  refreshHealthCheck({ campaignId }) {
    const healthCheckJob = Jobs.findOne({
      type: "campaigns.healthCheck",
      "data.campaignId": campaignId,
    });
    if (healthCheckJob) {
      if (
        healthCheckJob.status == "failed" ||
        healthCheckJob.status == "cancelled"
      ) {
        Jobs.getJob(healthCheckJob._id).restart();
        Jobs.getJob(healthCheckJob._id).ready({ time: Jobs.foreverDate });
      } else if (healthCheckJob.status == "waiting") {
        Jobs.getJob(healthCheckJob._id).ready({ time: Jobs.foreverDate });
      }
    } else {
      JobsHelpers.addJob({
        jobType: "campaigns.healthCheck",
        jobData: {
          campaignId,
        },
      });
    }
  },
  refreshCampaignJobs({ campaignId }) {
    check(campaignId, String);
    const campaign = Campaigns.findOne(campaignId);

    // health check job
    this.refreshHealthCheck({ campaignId });

    let accountsIds = _.pluck(campaign.accounts, "facebookId");
    if (campaign.facebookAccount) {
      accountsIds.push(campaign.facebookAccount.facebookId);
    }
    if (accountsIds.length) {
      const accounts = FacebookAccounts.find({
        facebookId: { $in: accountsIds },
      }).fetch();
      for (const account of accounts) {
        this.refreshAccountJob({
          campaignId,
          facebookAccountId: account.facebookId,
          type: "entries",
        });
      }
    }
  },
  refreshAccountJob({ campaignId, facebookAccountId, type }) {
    logger.debug("CampaignsHelpers.refreshAccountJob: called", {
      campaignId,
      facebookAccountId,
      type,
    });
    const campaign = Campaigns.findOne(campaignId);

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    const account =
      _.findWhere(campaign.accounts, {
        facebookId: facebookAccountId,
      }) || campaign.facebookAccount;

    let jobType, jobData;
    switch (type) {
      case "entries":
        jobType = "entries.updateAccountEntries";
        jobData = {
          facebookId: facebookAccountId,
          accessToken: account.accessToken,
          campaignId: campaign._id,
        };
        break;
      case "refetch":
        jobType = "entries.refetchAccountEntries";
        jobData = {
          facebookId: facebookAccountId,
          accessToken: account.accessToken,
          campaignId: campaign._id,
        };
        break;
      case "fbUsers":
        jobType = "people.updateFBUsers";
        jobData = {
          campaignId,
          facebookAccountId,
        };
        break;
    }

    const query = {
      type: jobType,
    };

    for (const prop in jobData) {
      if (prop !== "accessToken") {
        query[`data.${prop}`] = jobData[prop];
      }
    }

    const job = Jobs.findOne(query);

    if (job) {
      if (job.status == "failed" || job.status == "cancelled") {
        Jobs.getJob(job._id).restart();
      } else if (job.status == "waiting") {
        Jobs.getJob(job._id).ready({ time: Jobs.foreverDate });
      }
    } else {
      JobsHelpers.addJob({
        jobType,
        jobData,
      });
    }
  },
  validateInvite({ invite }) {
    if (invite) {
      const inviteData = Invites.findOne({ key: invite, used: false });
      if (inviteData) {
        return inviteData.key;
      }
    }
    return false;
  },
  getInviteCampaign({ campaignId, inviteId }) {
    if (campaignId && inviteId) {
      return Campaigns.findOne({
        _id: campaignId,
        users: {
          $elemMatch: {
            inviteId,
          },
        },
      });
    }
    return false;
  },
  applyInvitation({ campaignId, inviteId, userId }) {
    const campaign = this.getInviteCampaign({ campaignId, inviteId });
    if (!campaign) {
      throw new Meteor.Error("Campaign invitation not found");
    }
    return Campaigns.update(
      {
        _id: campaignId,
        "users.inviteId": inviteId,
      },
      {
        $set: {
          "users.$.userId": userId,
          "users.$.status": "active",
        },
      }
    );
  },
  removeCampaign({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    // Expire and remove exports
    const exportJobs = Jobs.find({
      type: "people.expireExport",
      "data.campaignId": campaignId,
    }).fetch();
    if (exportJobs && exportJobs.length) {
      for (let job of exportJobs) {
        PeopleHelpers.expireExport({ exportId: job.data.exportId });
      }
    }
    PeopleExports.remove({ campaignId });

    this.clearCampaignJobs({ campaignId });

    FAQ.remove({ campaignId });
    People.remove({ campaignId });
    PeopleLists.remove({ campaignId });
    PeopleTags.remove({ campaignId });
    MapFeatures.remove({ campaignId });
    Notifications.remove({ campaignId });

    // Facebook accounts to delete
    let accountsIds = _.pluck(campaign.accounts, "facebookId");
    if (campaign.facebookAccount) {
      accountsIds.push(campaign.facebookAccount.facebookId);
    }
    const accounts = FacebookAccounts.find({
      facebookId: {
        $in: accountsIds,
      },
    }).fetch();
    for (const account of accounts) {
      const accountCampaignsCount = Campaigns.find({
        $or: [
          { accounts: { $elemMatch: { facebookId: account.facebookId } } },
          { "facebookAccount.facebookId": account.facebookId },
        ],
      }).count();
      if (accountCampaignsCount <= 1) {
        FacebookAccountsHelpers.removeAccount({
          facebookAccountId: account.facebookId,
          token: campaign.facebookAccount.accessToken,
        });
      }
    }

    return Campaigns.remove(campaignId);
  },
  clearCampaignJobs({ campaignId }) {
    check(campaignId, String);
    Jobs.remove({ "data.campaignId": campaignId });
  },
  suspendCampaign({ campaignId }) {
    check(campaignId, String);
    Campaigns.update({ _id: campaignId }, { $set: { status: "suspended" } });
    this.disconnectAccount({ campaignId });
    this.clearCampaignJobs({ campaignId });
  },
  activateCampaign({ campaignId }) {
    check(campaignId, String);
    Campaigns.update({ _id: campaignId }, { $set: { status: "active" } });
    this.refreshCampaignJobs({ campaignId });
  },
};

exports.CampaignsHelpers = CampaignsHelpers;
