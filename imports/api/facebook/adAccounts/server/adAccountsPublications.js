import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { AdAccounts } from "/imports/api/facebook/adAccounts/adAccounts.js";

Meteor.publish("adAccounts.byCampaign", function({ campaignId }) {
  const currentUser = this.userId;
  if (currentUser) {
    const campaign = Campaigns.findOne(campaignId);
    if (
      !_.findWhere(campaign.users, { userId: currentUser }) ||
      !campaign.adAccountId
    ) {
      return this.ready();
    }
    return AdAccounts.find({ _id: campaign.adAccountId.replace("act_", "") });
  } else {
    return this.ready();
  }
});
