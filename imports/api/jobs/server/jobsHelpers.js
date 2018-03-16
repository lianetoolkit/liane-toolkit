const { JobsUtils } = require("./jobsUtils.js");
const { Jobs } = require("../jobs.js");

Jobs.later.date.localTime();

export const JobsHelpers = {
  addJob({ jobType, jobData }) {
    check(jobType, String);
    check(jobData, Object);
    logger.debug("JobsHelpers.addJob: called", { jobType }, { jobData });

    const jobInCollectionId = JobsUtils.getJobInCollectionId({
      jobType,
      jobData
    });

    if (jobInCollectionId) {
      return jobInCollectionId;
    } else {
      const newJob = new Job(Jobs, jobType, jobData);
      const jobOptions = JobsPool.jobs[jobType].jobOptions(newJob.doc);
      logger.debug("JobsHelpers.addJob", { jobOptions });
      newJob.retry({
        retries:
          (jobOptions.retry != null ? jobOptions.retry.retries : undefined) ||
          1,
        wait:
          (jobOptions.retry != null ? jobOptions.retry.wait : undefined) ||
          5 * 60 * 1000,
        backoff:
          (jobOptions.retry != null ? jobOptions.retry.backoff : undefined) ||
          "constant"
      }); // default 5 minutes
      if (jobOptions.delay != null) {
        newJob.delay(jobOptions.delay);
      }
      if (jobOptions.repeat != null) {
        newJob.repeat({
          wait: jobOptions.repeat.wait,
          schedule: jobOptions.repeat.schedule
            ? Jobs.later.parse.cron(jobOptions.repeat.schedule, true)
            : undefined,
          until: jobOptions.repeat.until || Jobs.foreverDate
        });
      }
      const jobId = newJob.save();
      return jobId;
    }
  },

  removeJob({ jobType, jobData }) {
    check(jobType, String);
    check(jobData, Object);
    logger.debug("JobsHelpers.removeJob: called", { jobType }, { jobData });

    const removeJobQuery = {
      type: jobType,
      data: jobData
    };
    const flattenedRemoveJobQuery = Utils.flatten(removeJobQuery);

    const jobsToRemoveIds = _.pluck(
      Jobs.find(flattenedRemoveJobQuery, { fields: { _id: 1 } }).fetch(),
      "_id"
    );
    if (jobsToRemoveIds.length > 0) {
      Jobs.cancelJobs(jobsToRemoveIds); // need to cancel before remove
      Jobs.removeJobs(jobsToRemoveIds);
    }
  },

  // we use it to restart or remove the jobs that were running while the server restarted
  cleanIdleJobs() {
    logger.debug("Jobs.cleanIdleJobs: called");

    const jobsTypesToRemove = [];

    const jobsToRestart = Jobs.find(
      {
        status: "running",
        type: {
          $nin: jobsTypesToRemove
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();
    if (jobsToRestart && jobsToRestart.length) {
      const jobsToRestartIds = _.pluck(jobsToRestart, "_id");

      if (jobsToRestartIds.length) {
        logger.debug("Jobs.cleanIdleJobs: restarting this jobs", {
          jobsToRestartIds
        });
      }
      Jobs.cancelJobs(jobsToRestartIds); // need to cancel before restart
      Jobs.restartJobs(jobsToRestartIds);
    }

    const jobsToRemove = Jobs.find(
      {
        status: "running",
        type: {
          $in: jobsTypesToRemove
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();
    if (jobsToRemove && jobsToRemove.length) {
      const jobsToRemoveIds = _.pluck(jobsToRemove, "_id");

      if (jobsToRemoveIds.length) {
        logger.debug("Jobs.cleanIdleJobs: removing this jobs", {
          jobsToRemoveIds
        });
      }
      Jobs.cancelJobs(jobsToRemoveIds); // need to cancel before remove
      return Jobs.removeJobs(jobsToRemoveIds);
    }
  }
};
