import {
  People,
  PeopleLists,
  PeopleExports
} from "/imports/api/facebook/people/people.js";
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
  "people.sumPersonInteractions": {
    run({ job }) {
      logger.debug("people.updateFBUsers job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookId, String);
      let errored = false;
      try {
        const person = People.findOne({
          campaignId: job.data.campaignId,
          facebookId: job.data.facebookId
        });
        PeopleHelpers.updateInteractionCountSum({
          personId: person._id
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
      concurrency: 30
    },
    jobOptions() {
      return {
        retry: {
          retries: 2,
          wait: 1000
        }
      };
    }
  },
  "people.export": {
    run({ job }) {
      logger.debug("people.export job: called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.query, Object);

      let errored = false;
      try {
        PeopleHelpers.export({
          campaignId: job.data.campaignId,
          query: job.data.query
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
      concurrency: 5
    },
    jobOptions() {
      return {
        retry: {
          retries: 2,
          wait: 5 * 1000
        }
      };
    }
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
          exportId: job.data.exportId
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
      concurrency: 20
    },
    jobOptions(job) {
      return {
        after: job.data.expirationDate,
        retry: {
          retries: 0,
          wait: 5 * 1000
        }
      };
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
          retries: 0,
          wait: 5 * 1000
        }
      };
      return options;
    }
  }
};

exports.PeopleJobs = PeopleJobs;
