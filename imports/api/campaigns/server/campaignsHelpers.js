import { Promise } from "meteor/promise";
import axios from "axios";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import {
  People,
  PeopleTags,
  PeopleLists
} from "/imports/api/facebook/people/people.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { Canvas } from "/imports/api/canvas/canvas.js";
import { Jobs } from "/imports/api/jobs/jobs.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { FacebookAudiencesHelpers } from "/imports/api/facebook/audiences/server/audiencesHelpers.js";
import { UsersHelpers } from "/imports/api/users/server/usersHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import _ from "underscore";

const YEEKO = Meteor.settings.yeeko;

const CampaignsHelpers = {
  refreshCampaignAccountsTokens({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const accounts = campaign.accounts;
    const users = campaign.users;
    let tokens = {};
    for (let campaignUser of users) {
      let userAccounts = {};
      try {
        userAccounts = FacebookAccountsHelpers.getUserAccounts({
          userId: campaignUser.userId
        });
      } catch (e) {
        console.log(e);
      }
      if (userAccounts && userAccounts.result && userAccounts.result.length) {
        userAccounts.result.forEach(acc => {
          if (accounts.find(account => acc.id == account.facebookId)) {
            const tokenDebug = UsersHelpers.debugFBToken({
              token: acc.access_token
            });
            if (tokenDebug && tokenDebug.is_valid) {
              tokens[acc.id] = acc.access_token;
            }
          }
        });
      }
    }
    let update = [];
    for (let account of accounts) {
      if (tokens[account.facebookId]) {
        const longToken = FacebookAccountsHelpers.exchangeFBToken({
          token: tokens[account.facebookId]
        });
        if (longToken) {
          account.accessToken = longToken.result;
        }
      }
      update.push(account);
    }
    Campaigns.update({ _id: campaign._id }, { $set: { accounts: update } });
  },
  addAccount({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    const upsertObj = {
      $set: {
        name: account.name,
        category: account.category,
        fanCount: account.fan_count
      }
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);

    const token = FacebookAccountsHelpers.exchangeFBToken({
      token: account.access_token
    });

    const updateObj = {
      facebookId: account.id,
      accessToken: token.result,
      chatbot: {
        active: false
      }
    };

    Campaigns.update(
      { _id: campaignId },
      { $addToSet: { accounts: updateObj } }
    );

    JobsHelpers.addJob({
      jobType: "entries.updateAccountEntries",
      jobData: {
        campaignId,
        facebookId: account.id,
        accessToken: token.result
      }
    });
    JobsHelpers.addJob({
      jobType: "audiences.updateAccountAudience",
      jobData: {
        campaignId,
        facebookAccountId: account.id
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

    FacebookAudiences.remove({
      campaignId,
      facebookAccountId: facebookId
    });

    // Remove entry jobs
    Jobs.remove({
      $or: [
        { "data.facebookId": facebookId },
        { "data.facebookAccountId": facebookId }
      ],
      "data.campaignId": campaignId
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

    throw new Meteor.Error(500, "This method is unavailable");

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
    const campaign = Campaigns.findOne(campaignId);
    // if (campaign.audienceAccounts && campaign.audienceAccounts.length) {
    //   for (const account of campaign.audienceAccounts) {
    //     this.refreshAccountJob({
    //       campaignId,
    //       facebookAccountId: account.facebookId,
    //       type: "audiences"
    //     });
    //   }
    // }
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
      case "refetch":
        jobType = "entries.refetchAccountEntries";
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
  activateChatbot({ campaignId, facebookAccountId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = _.find(
      campaign.accounts,
      account => account.facebookId == facebookAccountId
    );
    const account = FacebookAccounts.findOne({ facebookId: facebookAccountId });

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    try {
      Promise.await(
        FB.api(`${facebookAccountId}/subscribed_apps`, "post", {
          subscribed_fields: [
            "messages",
            "message_deliveries",
            "messaging_postbacks",
            "message_deliveries",
            "message_reads"
          ],
          access_token: campaignAccount.accessToken
        })
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error trying to subscribe");
    }

    // try {
    //   const yeekoRes = Promise.await(
    //     axios.post(`${YEEKO.url}?api_key=${YEEKO.apiKey}`, {
    //       idPage: facebookAccountId,
    //       tokenPage: campaignAccount.accessToken,
    //       titulo: account.name,
    //       fanPage: `https://facebook.com/${facebookAccountId}`,
    //       description: "test"
    //     })
    //   );
    //   console.log(yeekoRes);
    // } catch (err) {
    //   console.log(err);
    //   throw new Meteor.Error(500, "Error connecting to Yeeko api");
    // }

    return Campaigns.update(
      { _id: campaignId, "accounts.facebookId": facebookAccountId },
      {
        $set: {
          "accounts.$.chatbot.active": true
        }
      }
    );
  },
  deactivateChatbot({ campaignId, facebookAccountId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = _.find(
      campaign.accounts,
      account => account.facebookId == facebookAccountId
    );

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    try {
      Promise.await(
        FB.api(`${facebookAccountId}/subscribed_apps`, "delete", {
          access_token: campaignAccount.accessToken
        })
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error trying to unsubscribe");
    }

    return Campaigns.update(
      { _id: campaignId, "accounts.facebookId": facebookAccountId },
      {
        $set: {
          "accounts.$.chatbot.active": false
        }
      }
    );
  },
  removeCampaign({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    this.clearCampaignJobs({ campaignId });

    People.remove({ campaignId });
    PeopleLists.remove({ campaignId });
    PeopleTags.remove({ campaignId });
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
