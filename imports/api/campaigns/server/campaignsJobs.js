import { Promise } from "meteor/promise";
import { Campaigns } from "../campaigns.js";
import { CampaignsHelpers } from "./campaignsHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";

const CampaignsJobs = {
  "campaigns.healthCheck": {
    run({ job }) {
      logger.debug("campaigns.healthCheck job: called");
      check(job && job.data && job.data.campaignId, String);

      const campaignId = job.data.campaignId;

      const campaign = Campaigns.findOne(campaignId);

      let errored = false;
      try {
        CampaignsHelpers.refreshCampaignAccountToken({
          campaignId,
        });
        FacebookAccountsHelpers.updateFBSubscription({
          facebookAccountId: campaign.facebookAccount.facebookId,
          token: campaign.facebookAccount.accessToken,
        });
      } catch (error) {
        errored = true;
        CampaignsHelpers.disconnectAccount({ campaignId });
        return job.fail(error.message);
      } finally {
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },

    workerOptions: {
      concurrency: 2,
      pollInterval: 2500,
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 1,
          wait: 5 * 60 * 1000,
        },
        repeat: {
          wait: 2 * 60 * 60 * 1000,
          // schedule: "0 0 12 * * *"
        },
      };
      return options;
    },
  },
};

exports.CampaignsJobs = CampaignsJobs;
