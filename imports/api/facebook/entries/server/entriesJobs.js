const { EntriesHelpers } = require("./entriesHelpers.js");
const {
  LikesHelpers
} = require("/imports/api/facebook/likes/server/likesHelpers.js");
const {
  CommentsHelpers
} = require("/imports/api/facebook/comments/server/commentsHelpers.js");

const EntriesJobs = {
  "entries.updateAccountEntries": {
    run({ job }) {
      logger.debug("entries.updateAccountEntries job: called");
      check(job && job.data && job.data.facebookId, String);
      check(job && job.data && job.data.accessToken, String);
      const campaignId = job.data.campaignId;
      const facebookId = job.data.facebookId;
      const accessToken = job.data.accessToken;
      let errored = false;
      try {
        EntriesHelpers.updateAccountEntries({
          campaignId,
          facebookId,
          accessToken
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
          retries: 1,
          wait: 5 * 60 * 1000
        },
        repeat: {
          wait: 2 * 60 * 60 * 1000
        }
      };
      return options;
    }
  },
  "entries.updateEntryInteractions": {
    run({ job }) {
      logger.debug("entries.updateEntryInteractions job: called");
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.entryId, String);
      check(job && job.data && job.data.accessToken, String);

      const interactionTypes = job.data.interactionTypes;
      const facebookAccountId = job.data.facebookAccountId;
      const accessToken = job.data.accessToken;
      const entryId = job.data.entryId;
      const campaignId = job.data.campaignId;

      let errored = false;
      try {
        EntriesHelpers.updateEntryInteractions({
          interactionTypes,
          facebookAccountId,
          accessToken,
          entryId,
          campaignId
        });
      } catch (error) {
        errored = true;
        job.fail(error.message);
      } finally {
        if (!errored) {
          job.done();
          return job.remove();
        }
      }
    },

    workerOptions: {
      concurrency: 4,
      pollInterval: 2500
    },

    jobOptions({ jobData }) {
      const options = {
        retry: {
          retries: 4,
          wait: 5 * 60 * 1000
        }
      };
      return options;
    }
  },
  "entries.updatePeopleLikesCount": {
    run({ job }) {
      logger.debug("entries.updatePeopleLikesCount job:called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.entryId, String);
      const { campaignId, facebookAccountId, entryId } = job.data;
      LikesHelpers.updatePeopleLikesCountByEntry({
        campaignId,
        facebookAccountId,
        entryId
      });
      job.done();
      return job.remove();
    },
    workerOptions: {
      concurrency: 4,
      pollInterval: 2500
    },
    jobOptions({ jobData }) {
      return {
        retry: {
          retries: 4,
          wait: 30 * 1000 // wait 30 seconds
        }
      };
    }
  },
  "entries.updatePeopleCommentsCount": {
    run({ job }) {
      logger.debug("entries.updatePeopleCommentsCount job:called");
      check(job && job.data && job.data.campaignId, String);
      check(job && job.data && job.data.facebookAccountId, String);
      check(job && job.data && job.data.entryId, String);
      const { campaignId, facebookAccountId, entryId } = job.data;
      CommentsHelpers.updatePeopleCommentsCountByEntry({
        campaignId,
        facebookAccountId,
        entryId
      });
      job.done();
      return job.remove();
    },
    workerOptions: {
      concurrency: 4,
      pollInterval: 2500
    },
    jobOptions({ jobData }) {
      return {
        retry: {
          retries: 4,
          wait: 30 * 1000 // wait 30 seconds
        }
      };
    }
  }
};

exports.EntriesJobs = EntriesJobs;
