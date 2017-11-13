const { FacebookAccountsHelpers } = require("./accountsHelpers.js");

const FacebookAccountsJobs = {
  "accounts.fetchEntries": {
    run({ job }) {
      logger.debug("accounts.fetchEntries job: called");
      check(job && job.data && job.data.facebookId, String);
      check(job && job.data && job.data.campaignId, String);

      const facebookId = job.data.facebookId;
      const accessToken = job.data.accessToken;

      FacebookAccountsHelpers.getAccountEntries({ facebookId, accessToken });

      job.done();
      return job.remove();
    },

    workerOptions: {
      concurrency: 2,
      pollInterval: 2500
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 1,
          wait: 1 * 60 * 1000
        }, // 5 minutes
        repeat: {
          schedule: "0 0/2 * * * *"
        }
      };
      return options;
    }
  }
};

exports.FacebookAccountsJobs = FacebookAccountsJobs;
