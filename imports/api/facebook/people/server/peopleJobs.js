import { PeopleHelpers } from "./peopleHelpers.js";

const PeopleJobs = {
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
          facebookAccountId
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
      pollInterval: 2500
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 10,
          wait: 10 * 60 * 1000
        }
      };
      return options;
    }
  },
  "people.importPerson": {
    run({ job }) {
      logger.debug("people.importPerson job: called");
      check(job && job.data && job.data.campaignId, String);
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
          person
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
      concurrency: 10,
      pollInterval: 2500
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 5,
          wait: 60 * 1000
        }
      };
      return options;
    }
  }
};

exports.PeopleJobs = PeopleJobs;
