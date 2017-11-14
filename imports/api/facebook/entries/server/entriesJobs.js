const { EntriesHelpers } = require("./entriesHelpers.js");

const EntriesJobs = {
  "entries.fetchByAccount": {
    run({ job }) {
      logger.debug("entries.fetchByAccount job: called");
      check(job && job.data && job.data.facebookId, String);
      check(job && job.data && job.data.accessToken, String);

      const facebookId = job.data.facebookId;
      const accessToken = job.data.accessToken;

      EntriesHelpers.getAccountEntries({ facebookId, accessToken });

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
  },
  "entries.fetchInteractions": {
    run({ job }) {
      logger.debug("entries.fetchInteractions job: called");
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.entryId, String);
      check(job && job.data && job.data.accessToken, String);

      const facebookAccountId = job.data.facebookAccountId;
      const accessToken = job.data.accessToken;
      const entryId = job.data.entryId;

      EntriesHelpers.getEntryInteractions({
        facebookAccountId,
        accessToken,
        entryId
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

exports.EntriesJobs = EntriesJobs;
