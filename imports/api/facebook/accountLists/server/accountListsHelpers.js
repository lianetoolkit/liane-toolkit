import { AccountLists } from "../accountLists.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";

const AccountListsHelpers = {
  facebookSearch({ accessToken, type, fields, q }) {
    return FB.api("search", {
      type,
      fields,
      q,
      access_token: accessToken
    });
  },
  addAccountToList({ accountListId, account, accessToken }) {
    check(accountListId, String);
    check(account, Object);

    logger.info("CampaignsHelpers.addAccountToCampaign: called", {
      accountListId,
      account
    });

    const accountList = AccountLists.findOne(accountListId);
    const campaign = Campaigns.findOne(accountList.campaignId);

    if (campaign.accounts && campaign.accounts.length) {
      accessToken = campaign.accounts[0].accessToken;
    }

    const updateObj = {
      facebookId: account.id
    };

    AccountLists.update(
      { _id: accountListId },
      { $addToSet: { accounts: updateObj } }
    );

    const upsertObj = {
      $set: {
        name: account.name,
        description: account.description,
        category: account.category
      }
    };

    FacebookAccounts.upsert({ facebookId: account.id }, upsertObj);
    JobsHelpers.addJob({
      jobType: "entries.updateAccountEntries",
      jobData: {
        facebookId: account.id,
        accessToken
      }
    });
    return;
  }
};

exports.AccountListsHelpers = AccountListsHelpers;
