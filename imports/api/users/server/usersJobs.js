const { UsersHelpers } = require("./usersHelpers.js");

const UsersJobs = {
  "users.supervisor": {
    run({ job }) {
      logger.debug("users.supervisor: called");
      check(job && job.data && job.data.userId, String);

      const userId = job.data.userId;

      UsersHelpers.supervise({ userId });

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
          wait: 5 * 60 * 1000
        }, // 5 minutes
        repeat: {
          schedule: `0 ${_.random(0, 59)} * * * *`
        }
      };
      return options;
    }
  }
};

exports.UsersJobs = UsersJobs;
