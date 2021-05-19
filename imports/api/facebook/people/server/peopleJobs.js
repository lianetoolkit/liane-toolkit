import {
  People,
  PeopleLists,
  PeopleExports,
} from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "./peopleHelpers.js";
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers";
import { Jobs } from "/imports/api/jobs/jobs";
import { Promise } from "meteor/promise";

let importJobs = {};
const updateImportJob = (job, personJobId) => {
  if (!job || !job._doc) return;
  const id = job._doc._id;
  if (!importJobs[id]) importJobs[id] = {};
  importJobs[id][personJobId] = true;
  const completed = Object.keys(importJobs[id]).length;
  const jobData = job._doc.data;
  if (completed == jobData.count) {
    delete importJobs[id];
    job.done();
    job.remove();
    NotificationsHelpers.clear({
      campaignId: jobData.campaignId,
      category: "peopleImportStart",
      dataRef: jobData.listId,
    });
    NotificationsHelpers.add({
      campaignId: jobData.campaignId,
      category: "peopleImportEnd",
      dataRef: jobData.listId,
      skipEmailNotify: true,
      path: `/people?source=list%3A${jobData.listId}`,
    });
  } else {
    job.progress(completed, jobData.count, { echo: true }, (err, res) => {
      if (err) {
        console.log(err);
      }
    });
  }
};

const PeopleJobs = {
  /* TODO */
  "people.upsertPerson": {
    run({ job }) {
      logger.debug("people.upsertPerson job: called");
    },
    workerOptions: {
      concurrency: 1,
      pollInterval: 2500,
    },
    jobOptions() {
      const options = {
        retry: {
          retries: 5,
          wait: 5 * 1000,
        },
      };
      return options;
    },
  },
  "people.updateFBUsers": {
    run({ job }) {
      logger.debug("people.updateFBUsers job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookAccountId, String);
      const campaignId = job.data.campaignId;
      const facebookAccountId = job.data.facebookAccountId;
      let errored = false;
      try {
        PeopleHelpers.updateFBUsers({
          campaignId,
          facebookAccountId,
        });
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
      pollInterval: 2500,
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 10,
          wait: 10 * 60 * 1000,
        },
      };
      return options;
    },
  },
  "people.export": {
    run({ job }) {
      logger.debug("people.export job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.query, String);

      let errored = false;
      try {
        PeopleHelpers.export({
          campaignId: job.data.campaignId,
          query: JSON.parse(job.data.query),
        });
      } catch (error) {
        errored = true;
        logger.error(error);
        return job.fail(error.message);
      } finally {
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },
    workerOptions: {
      concurrency: 5,
    },
    jobOptions() {
      return {
        retry: {
          retries: 2,
          wait: 5 * 1000,
        },
      };
    },
  },
  "people.expireExport": {
    run({ job }) {
      logger.debug("people.expireExport job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.exportId, String);
      check(job && job.data && job.data.expirationDate, Date);
      let errored = false;
      try {
        PeopleHelpers.expireExport({
          exportId: job.data.exportId,
        });
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
      concurrency: 20,
    },
    jobOptions(job) {
      return {
        after: job.data.expirationDate,
        retry: {
          retries: 0,
          wait: 5 * 1000,
        },
      };
    },
  },
  "people.import": {
    async run({ job }) {
      logger.debug("people.import job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.count, Number);
      check(job && job.data && job.data.listId, String);
      NotificationsHelpers.add({
        campaignId: job.data.campaignId,
        category: "peopleImportStart",
        sticky: true,
        skipEmailNotify: true,
        dataRef: job.data.listId,
      });
    },
    workerOptions: {
      concurrency: 10,
      pollInterval: 2500,
    },
    jobOptions() {
      const options = {
        retry: {
          retries: 0,
          wait: 5 * 1000,
        },
      };
      return options;
    },
  },
  "people.importPerson": {
    run({ job }) {
      logger.debug("people.importPerson job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.jobId, String);
      check(job && job.data && job.data.listId, String);
      check(job && job.data && job.data.person, String);
      const campaignId = job.data.campaignId;
      const listId = job.data.listId;
      const person = JSON.parse(job.data.person);
      let errored = false;
      try {
        PeopleHelpers.importPerson({
          campaignId,
          listId,
          person,
        });
      } catch (error) {
        errored = true;
        logger.error(error);
        job.fail(error.message);
      } finally {
        const parentJob = Jobs.getJob(job.data.jobId);
        updateImportJob(parentJob, job._doc._id);
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },

    workerOptions: {
      concurrency: 100,
      pollInterval: 2500,
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 0,
          wait: 5 * 1000,
        },
      };
      return options;
    },
  },
};

exports.PeopleJobs = PeopleJobs;
