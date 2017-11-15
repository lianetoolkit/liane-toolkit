const { FacebookAudiencesHelpers } = require("./audiencesHelpers.js");

const AudiencesJobs = {
  "audiences.fetchByAudienceCategory": {
    run({ job }) {
      logger.debug("entries.fetchByAccount job: called");
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.audienceCategoryId, String);

      const facebookAccountId = job.data.facebookAccountId;
      const audienceCategoryId = job.data.audienceCategoryId;

      FacebookAudiencesHelpers.fetchAudienceCategory({
        facebookAccountId,
        audienceCategoryId
      });

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
        } // 5 minutes
        // repeat: {
        //   schedule: "0 0/1 * * * *"
        // }
      };
      return options;
    }
  }
};

exports.AudiencesJobs = AudiencesJobs;
