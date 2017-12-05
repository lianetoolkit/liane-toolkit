const { FacebookAudiencesHelpers } = require("./audiencesHelpers.js");

const AudiencesJobs = {
  "audiences.fetchAudienceByCategory": {
    run({ job }) {
      logger.debug("audiences.fetchAudienceByCategory job: called");
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.audienceCategoryId, String);

      const contextId = job.data.contextId;
      const facebookAccountId = job.data.facebookAccountId;
      const audienceCategoryId = job.data.audienceCategoryId;

      let errored = false;
      try {
        FacebookAudiencesHelpers.fetchAudienceByCategory({
          contextId,
          facebookAccountId,
          audienceCategoryId
        });
      } catch (err) {
        errored = true;
        return job.fail();
      } finally {
        if(!errored) {
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
          wait: 1 * 60 * 1000 * 5
        }
        // repeat: {
        //   schedule: "0 0/1 * * * *"
        // }
      };
      return options;
    }
  }
};

exports.AudiencesJobs = AudiencesJobs;
