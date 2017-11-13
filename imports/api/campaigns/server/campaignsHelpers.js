import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";

const CampaignsHelpers = {
  addAccountToCampaign({ campaignId, account }) {
    check(campaignId, String);
    check(account, Object);

    logger.info("CampaignsHelpers.addAccountToCampaign: called", {
      campaignId,
      account
    });

    const updateObj = {
      facebookId: account.id,
      accessToken: account.access_token
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
    return;
  }
};

exports.CampaignsHelpers = CampaignsHelpers;
