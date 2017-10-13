const { JobsUtils } = require("./jobsUtils.js");
const { Jobs } = require("../jobs.js");

Jobs.later.date.localTime();

export const JobsHelpers = {
  addJob({ jobType, jobData }) {
    check(jobType, String);
    check(jobData, Object);
    logger.debug("JobsHelpers.addJob: called", { jobType }, { jobData });

    if (!JobsUtils.isJobDuplicated({ jobType, jobData })) {
      const newJob = new Job(Jobs, jobType, jobData);
      const jobOptions = JobsPool.jobs[jobType].jobOptions({ jobData });
      logger.debug("JobsHelpers.addJob", { jobOptions });
      newJob.retry({
        retries:
          (jobOptions.retry != null ? jobOptions.retry.retries : undefined) ||
          1,
        wait:
          (jobOptions.retry != null ? jobOptions.retry.wait : undefined) ||
          5 * 60 * 1000
      }); // default 5 minutes
      if (jobOptions.delay != null) {
        newJob.delay(jobOptions.delay);
      }
      if (jobOptions.repeat != null) {
        newJob.repeat({
          schedule: Jobs.later.parse.cron(jobOptions.repeat.schedule, true),
          until: jobOptions.repeat.until || Jobs.foreverDate
        });
      }
      const jobId = newJob.save();
      return jobId;
    }
    return false;
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

    const jobsTypesToRestart = [
      "serviceAccounts.updateData",
      "conversions.update",
      "conversions.calculate",
      "serviceAccounts.setup",
      "serviceAccounts.login"
    ];

    const jobsToRestart = Jobs.find(
      {
        status: "running",
        type: {
          $in: jobsTypesToRestart
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();

    const jobsToRestartIds = _.pluck(jobsToRestart, "_id");

    if (jobsToRestartIds.length) {
      logger.info("Jobs.cleanIdleJobs: restarting this jobs", {
        jobsToRestartIds
      });
    }
    Jobs.cancelJobs(jobsToRestartIds); // need to cancel before restart
    Jobs.restartJobs(jobsToRestartIds);

    const jobsToRemove = Jobs.find(
      {
        status: "running",
        type: {
          $nin: jobsTypesToRestart
        }
      },
      {
        fields: {
          _id: 1
        }
      }
    ).fetch();

    const jobsToRemoveIds = _.pluck(jobsToRemove, "_id");

    if (jobsToRemoveIds.length) {
      logger.info("Jobs.cleanIdleJobs: removing this jobs", {
        jobsToRemoveIds
      });
    }
    Jobs.cancelJobs(jobsToRemoveIds); // need to cancel before remove
    return Jobs.removeJobs(jobsToRemoveIds);
  }
};
