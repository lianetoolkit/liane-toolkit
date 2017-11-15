import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

import { HTTP } from "meteor/http";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};
_fb = new Facebook(options);

_fetchFacebookPageData = ({ url }) => {
  check(url, String);

  response = HTTP.get(url);
  return response;
};

const EntriesHelpers = {
  getAccountEntries({ campaignId, facebookId, accessToken }) {
    check(campaignId, String);
    check(facebookId, String);
    check(accessToken, String);

    logger.debug("EntriesHelpers.getAccountEntries called", {
      facebookId
    });

    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api("me/feed", {
        fields: [
          "object_id",
          "parent_id",
          "message",
          "link",
          "type",
          "created_time",
          "updated_time"
        ],
        limit: 100
      })
    );

    const _insertBulk = ({ data }) => {
      const bulk = Entries.rawCollection().initializeUnorderedBulkOp();

      for (const entry of data) {
        entry.facebookAccountId = facebookId;
        entry._id = entry.id;
        delete entry.id;
        bulk
          .find({ _id: entry._id })
          .upsert()
          .update({
            $set: entry
          });
        JobsHelpers.addJob({
          jobType: "entries.fetchInteractions",
          jobData: {
            facebookAccountId: entry.facebookAccountId,
            accessToken: accessToken,
            entryId: entry._id,
            campaignId: campaignId
          }
        });
      }

      bulk.execute(function(e, result) {
        // do something with result
        console.info("result", result.nInserted);
      });
    };

    if (response.data.length) {
      _insertBulk({ data: response.data });
      let next = response.paging.next;
      while (next !== undefined) {
        let nextPage = _fetchFacebookPageData({ url: next });
        next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
        if (nextPage.statusCode == 200 && nextPage.data.data.length) {
          _insertBulk({ data: nextPage.data.data });
        }
      }
    }

    return;
  },
  getEntryInteractions({
    campaignId,
    facebookAccountId,
    entryId,
    accessToken
  }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("EntriesHelpers.getEntryInteractions called", {
      entryId
    });
    CommentsHelpers.getEntryComments({
      facebookAccountId,
      entryId,
      accessToken,
      campaignId
    });
    LikesHelpers.getEntryLikes({
      facebookAccountId,
      entryId,
      accessToken,
      campaignId
    });
  }
};

exports.EntriesHelpers = EntriesHelpers;
