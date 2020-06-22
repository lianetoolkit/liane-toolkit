import { CampaignsJobs } from "/imports/api/campaigns/server/campaignsJobs.js";
import { EntriesJobs } from "/imports/api/facebook/entries/server/entriesJobs.js";
import { PeopleJobs } from "/imports/api/facebook/people/server/peopleJobs.js";
import { EmailsJobs } from "/imports/emails/server/jobs.js";
import { Jobs } from "../jobs.js";
import { JobsHelpers } from "./jobsHelpers.js";

// init jobs pool for workers
JobsPool.jobs = _.extend(CampaignsJobs, EntriesJobs, PeopleJobs, EmailsJobs);

let _runJob;
Meteor.startup(function() {
  if (
    !Meteor.settings.public.server ||
    Meteor.settings.public.server == "jobs"
  ) {
    Jobs.startJobServer();
    return JobsHelpers.cleanIdleJobs();
  }
});

if (Meteor.settings.public.deployMode === "local") {
  _runJob = function(job, callback) {
    const startTime = new Date().getTime();
    const { data } = job;
    const jobType = job.type;
    logger.debug("JobsHelpers.runJob: called", {
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
      logger.debug("JobsHelpers.runJob: called", {
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
      logger.debug("JobsHelpers.runJob: finished", {
        jobType,
        jobData: data,
        totalTime: totalTime.toFixed(3)
      });
      callback();
    }
  };
}

if (!Meteor.settings.server || Meteor.settings.server == "jobs") {
  for (let jobType of Array.from(_.keys(JobsPool.jobs))) {
    const workerOptions = JobsPool.jobs[jobType].workerOptions || {};
    Jobs.processJobs(jobType, workerOptions, _runJob);
  }
}
