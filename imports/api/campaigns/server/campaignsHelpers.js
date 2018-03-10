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
  addAccountToCampaign({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    logger.info("CampaignsHelpers.addAccountToCampaign: called", {
      campaignId,
      account
    });

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
        category: account.category
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
      jobType: "audiences.updateAccountAudience",
      jobData: {
        campaignId,
        facebookAccountId: account.id
      }
    });
    return;
  },
  removeCampaign({ campaignId }) {

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    Jobs.remove({ "data.campaignId": campaignId });
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
  suspendAdAccount({ campaignId }) {
    check(campaignId, String);
    Campaigns.update(
      { _id: campaignId },
      { $set: { adAccountId: null, status: "invalid_adaccount" } }
    );
  }
};

exports.CampaignsHelpers = CampaignsHelpers;
