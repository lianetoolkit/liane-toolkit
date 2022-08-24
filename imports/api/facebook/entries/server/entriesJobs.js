const { EntriesHelpers } = require("./entriesHelpers.js");
// import moment from "moment";
const {
  LikesHelpers,
} = require("/imports/api/facebook/likes/server/likesHelpers.js");
const {
  CommentsHelpers,
} = require("/imports/api/facebook/comments/server/commentsHelpers.js");

const EntriesJobs = {
  "entries.updateAccountEntries": {
    run({ job }) {
      logger.debug("entries.updateAccountEntries job: called");
      logger.info(`entries.updateAccountEntries job started: ${JSON.stringify(job)}`);
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookId, String);
      const campaignId = job.data.campaignId;
      const facebookId = job.data.facebookId;
      const createdTs = new Date(job._doc.created).getTime();
      const todayTs = new Date().getTime();
      const DAY_IN_MS = 24 * 60 * 60 * 1000;
      const isRecent = todayTs - createdTs < DAY_IN_MS;
      // const likeDateEstimate = job._doc.repeated > 0 && isRecent;
      const likeDateEstimate = false;
      let errored = false;
      try {
        EntriesHelpers.updateAccountEntries({
          campaignId,
          facebookId,
          likeDateEstimate,
          forceUpdate: false,
        });
      } catch (error) {
        errored = true;
        return job.fail(error.message);
      } finally {
        logger.info(`entries.updateAccountEntries job finished: ${JSON.stringify(job)}`);
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },

    workerOptions: {
      concurrency: 1,
      pollInterval: 2500,
    },

    jobOptions() {
      const options = {
        retry: {
          retries: 1,
          wait: 5 * 60 * 1000,
        },
        repeat: {
          wait: 2 * 60 * 60 * 1000,
        },
      };
      return options;
    },
  },
  "entries.refetchAccountEntries": {
    run({ job }) {
      logger.debug("entries.refetchAccountEntries job: called");
      logger.info(`entries.refetchAccountEntries job started: ${JSON.stringify(job)}`);
      check(job && job.data && job.data.facebookId, String);
      const campaignId = job.data.campaignId;
      const facebookId = job.data.facebookId;
      let errored = false;
      try {
        EntriesHelpers.updateAccountEntries({
          campaignId,
          facebookId,
          likeDateEstimate: false,
          forceUpdate: true,
        });
      } catch (error) {
        errored = true;
        return job.fail(error.message);
      } finally {
        logger.info(`entries.refetchAccountEntries job finished: ${JSON.stringify(job)}`);
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
          retries: 1,
          wait: 5 * 60 * 1000,
        },
      };
      return options;
    },
  },
  "entries.updateEntryInteractions": {
    run({ job }) {
      logger.debug("entries.updateEntryInteractions job: called");
      logger.info(`entries.updateEntryInteractions job started: ${JSON.stringify(job)}`);
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.entryId, String);
      check(job && job.data && job.data.accessToken, String);
      check(job && job.data && job.data.likeDateEstimate, Boolean);

      const interactionTypes = job.data.interactionTypes;
      const facebookAccountId = job.data.facebookAccountId;
      const accessToken = job.data.accessToken;
      const entryId = job.data.entryId;
      const campaignId = job.data.campaignId;
      const likeDateEstimate = job.data.likeDateEstimate;

      let errored = false;
      try {
        EntriesHelpers.updateEntryInteractions({
          interactionTypes,
          facebookAccountId,
          accessToken,
          entryId,
          campaignId,
          likeDateEstimate,
        });
      } catch (error) {
        errored = true;
        job.fail(error.message);
      } finally {
        logger.info(`entries.updateEntryInteractions job finished: ${JSON.stringify(job)}`);
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },

    workerOptions: {
      concurrency: 4,
      pollInterval: 2500,
    },

    jobOptions({ jobData }) {
      const options = {
        retry: {
          retries: 3,
          wait: 10 * 1000,
        },
      };
      return options;
    },
  },
};

exports.EntriesJobs = EntriesJobs;
