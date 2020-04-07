import { Promise } from "meteor/promise";
const { CampaignsHelpers } = require("./campaignsHelpers.js");

const CampaignsJobs = {
  "campaigns.healthCheck": {
    run({ job }) {
      logger.debug("campaigns.healthCheck job: called");
      check(job && job.data && job.data.campaignId, String);

      const campaignId = job.data.campaignId;

      let errored = false;
      try {
        CampaignsHelpers.refreshCampaignAccountToken({
          campaignId
        });
      } catch (error) {
        errored = true;
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
      pollInterval: 2500
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 3,
          wait: 5 * 60 * 1000
        },
        repeat: {
          wait: 2 * 60 * 60 * 1000
          // schedule: "0 0 12 * * *"
        }
      };
      return options;
    }
  }
};

exports.CampaignsJobs = CampaignsJobs;
