import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { People } from "/imports/api/facebook/people/people.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import _ from "underscore";

const CampaignsHelpers = {
  addAccount({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    const token = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token
    });

    const updateObj = {
      facebookId: account.id,
      accessToken: token.result
    };

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { accounts: updateObj } }
    );

    const upsertObj = {
      $set: {
        name: account.name,
        category: account.category,
        fanCount: account.fan_count
      }
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);
    JobsHelpers.addJob({
      jobType: "entries.updateAccountEntries",
      jobData: {
        campaignId,
        facebookId: account.id,
        accessToken: token.result
      }
    });
    JobsHelpers.addJob({
      jobType: "people.updateFBUsers",
      jobData: {
        campaignId,
        facebookAccountId: account.id
      }
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
      account = campaign.accounts.find(acc => acc.facebookId == facebookId);
    }

    // Remove entry jobs
    Jobs.remove({
      $or: [
        { "data.facebookId": facebookId },
        { "data.facebookAccountId": facebookId }
      ],
      "data.campaignId": campaignId,
      type: {
        $in: [
          "entries.updateAccountEntries",
          "entries.updateEntryInteractions",
          "entries.updatePeopleLikesCount",
          "entries.updatePeopleCommentsCount",
          "people.updateFBUsers"
        ]
      }
    });

    if (account) {
      Campaigns.update({ _id: campaignId }, { $pull: { accounts: account } });
    }
    return;
  },
  addAudienceAccount({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    logger.debug("CampaignsHelpers.addAudienceAccountToCampaign: called", {
      campaignId,
      account
    });

    let updateObj = {
      facebookId: account.id,
      name: account.name
    };

    if (account.fan_count) {
      updateObj.fanCount = account.fan_count;
    }

    const campaign = Campaigns.findOne(campaignId);

    const audienceAccount = _.findWhere(campaign.audienceAccounts, {
      facebookId: account.id
    });

    if (audienceAccount) {
      throw new Meteor.Error(403, "Audience Account already connected");
    }

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { audienceAccounts: updateObj } }
    );

    JobsHelpers.addJob({
      jobType: "audiences.updateAccountAudience",
      jobData: {
        campaignId,
        facebookAccountId: account.id
      }
    });
    return;
  },
  removeAudienceAccount({ campaignId, facebookId }) {
    check(campaignId, String);
    check(facebookId, String);

    const audienceAccount = _.findWhere(campaign.audienceAccounts, {
      facebookId
    });

    if (!audienceAccount) {
      throw new Meteor.Error(404, "Audience Account not found");
    }

    Jobs.remove({
      "data.campaignId": campaignId,
      "data.facebookAccountId": facebookId
    });

    FacebookAudiences.remove({
      campaignId,
      facebookAccountId: facebookId
    });

    return Campaigns.update(
      { _id: campaignId },
      { $pull: { audienceAccounts: audienceAccount } }
    );
  },
  refreshCampaignJobs({ campaignId }) {
    check(campaignId, String);
    if (campaign.audienceAccounts && campaign.audienceAccounts.length) {
      for (const account of campaign.audienceAccounts) {
        this.refreshAccountJob({
          campaignId,
          facebookAccountId: account.facebookId,
          type: "audiences"
        });
      }
    }
    if (campaign.accounts && campaign.accounts.length) {
      const accounts = FacebookAccounts.find({
        facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
      }).fetch();
      for (const account of accounts) {
        this.refreshAccountJob({
          campaignId,
          facebookAccountId: account.facebookId,
          type: "entries"
        });
        this.refreshAccountJob({
          campaignId,
          facebookAccountId: account.facebookId,
          type: "audiences"
        });
      }
    }
  },
  refreshAccountJob({ campaignId, facebookAccountId, type }) {
    logger.debug("CampaignsHelpers.refreshAccountJob: called", {
      campaignId,
      facebookAccountId,
      type
    });
    const campaign = Campaigns.findOne(campaignId);

    if (campaign.status == "suspended") {
      throw new Meteor.Error(401, "This campaign is suspended");
    }

    const account = _.findWhere(campaign.accounts, {
      facebookId: facebookAccountId
    });

    let jobType, jobData;
    switch (type) {
      case "entries":
        jobType = "entries.updateAccountEntries";
        jobData = {
          facebookId: facebookAccountId,
          accessToken: account.accessToken,
          campaignId: campaign._id
        };
        break;
      case "audiences":
        jobType = "audiences.updateAccountAudience";
        jobData = {
          campaignId: campaign._id,
          facebookAccountId: facebookAccountId
        };
        break;
      case "fbUsers":
        jobType = "people.updateFBUsers";
        jobData = {
          campaignId,
          facebookAccountId
        };
        break;
    }

    const query = {
      type: jobType
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
        jobData
      });
    }
  },
  removeCampaign({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    this.clearCampaignJobs({ campaignId });

    People.remove({ campaignId });
    Canvas.remove({ campaignId });
    FacebookAudiences.remove({ campaignId });

    // Facebook accounts to delete
    const accounts = FacebookAccounts.find({
      facebookId: { $in: _.pluck(campaign.accounts, "facebookId") }
    }).fetch();
    for (const account of accounts) {
      const accountCampaignsCount = Campaigns.find({
        accounts: {
          $elemMatch: {
            facebookId: account.facebookId
          }
        }
      }).count();
      if (accountCampaignsCount <= 1) {
        FacebookAccountsHelpers.removeAccount({
          facebookAccountId: account.facebookId
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
    this.clearCampaignJobs({ campaignId });
  },
  activateCampaign({ campaignId }) {
    check(campaignId, String);
    Campaigns.update({ _id: campaignId }, { $set: { status: "active" } });
    this.refreshCampaignJobs({ campaignId });
  },
  suspendAdAccount({ campaignId }) {
    check(campaignId, String);
    Campaigns.update(
      { _id: campaignId },
      { $set: { adAccountId: null, status: "invalid_adaccount" } }
    );
  }
};

exports.CampaignsHelpers = CampaignsHelpers;
