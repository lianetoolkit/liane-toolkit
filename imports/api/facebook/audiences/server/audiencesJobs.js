import { Promise } from "meteor/promise";
const { FacebookAudiencesHelpers } = require("./audiencesHelpers.js");

const AudiencesJobs = {
  "audiences.updateAccountAudience": {
    run({ job }) {
      logger.debug("audiences.updateAccountAudience job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookAccountId, String);

      const campaignId = job.data.campaignId;
      const facebookAccountId = job.data.facebookAccountId;

      let errored = false;
      try {
        Promise.await(
          FacebookAudiencesHelpers.updateAccountAudience({
            campaignId,
            facebookAccountId
          })
        );
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
        delay: 1000,
        repeat: {
          wait: 6 * 60 * 60 * 1000
          // schedule: "0 0 12 * * *"
        }
      };
      return options;
    }
  },
  "audiences.fetchAndCreateSpecAudience": {
    run({ job }) {
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.geolocationId, String);
      check(job && job.data && job.data.audienceCategoryId, String);
      check(job && job.data && job.data.spec, Object);

      const facebookAccountId = job.data.facebookAccountId;
      const geolocationId = job.data.geolocationId;
      const audienceCategoryId = job.data.audienceCategoryId;
      const spec = job.data.spec;

      let errored = false;
      try {
        Promise.await(
          FacebookAudiencesHelpers.fetchAndCreateSpecAudience({
            facebookAccountId,
            geolocationId,
            audienceCategoryId,
            spec
          })
        );
      } catch (error) {
        errored = true;
        job.fail(error.message);
      } finally {
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },
    workerOptions: {
      concurrency: 1,
      pollInterval: 2500
    },
    jobOptions() {
      const options = {
        retry: {
          retries: 5,
          wait: 10 * 60 * 1000
        },
        delay: 2000
      };
      return options;
    }
  }
};

exports.AudiencesJobs = AudiencesJobs;
