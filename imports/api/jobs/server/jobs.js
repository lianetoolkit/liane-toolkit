import { EntriesJobs } from "/imports/api/facebook/entries/server/entriesJobs.js";
import { AudiencesJobs } from "/imports/api/facebook/audiences/server/audiencesJobs.js";
import { Jobs } from "../jobs.js";
import { JobsHelpers } from "./jobsHelpers.js";

// init jobs pool for workers
JobsPool.jobs = _.extend(EntriesJobs, AudiencesJobs);
// logger.debug JobsPool.jobs

// logger.debug "jobs.js: initializing JobsPool", {JobsPool}

// logger.info "> Jobs worker: adding #{_.keys(JobsPool.jobs)} jobs"
let _runJob;
Meteor.startup(function() {
  Jobs.startJobServer();
  if (Meteor.settings.public.deployMode != "local") {
    return JobsHelpers.cleanIdleJobs();
  }
});

if (Meteor.settings.public.deployMode === "local") {
  _runJob = function(job, callback) {
    const startTime = new Date().getTime();
    const { data } = job;
    const jobType = job.type;
    logger.info("JobsHelpers.runJob: called", {
      jobType,
      jobId: job.doc._id,
      jobData: data
    });
    JobsPool.jobs[jobType].run({ job });
    return callback();
  };
} else {
  _runJob = function(job, callback) {
    const startTime = new Date().getTime();
    const { data } = job;
    const jobType = job.type;
    try {
      logger.info("JobsHelpers.runJob: called", {
        jobType,
        jobId: job.doc._id,
        jobData: data
      });
      return JobsPool.jobs[jobType].run({ job });
    } catch (error) {
      logger.warn("JobsHelpers.runJob: unexpected error catched", {
        jobType,
        jobData: data,
        error
      });
      try {
        job.done();
        return job.remove();
      } catch (error1) {
        error = error1;
        return logger.warn(
          "JobsHelpers.runJob: error while removing job after unexpected error",
          { jobType, jobData: data, error }
        );
      }
    } finally {
      const finishTime = new Date().getTime();
      const totalTime = (finishTime - startTime) / (60 * 1000);
      logger.info("JobsHelpers.runJob: finished", {
        jobType,
        jobData: data,
        totalTime: totalTime.toFixed(3)
      });
      callback();
    }
  };
}

for (let jobType of Array.from(_.keys(JobsPool.jobs))) {
  const workerOptions = JobsPool.jobs[jobType].workerOptions || {};
  Jobs.processJobs(jobType, workerOptions, _runJob);
}
