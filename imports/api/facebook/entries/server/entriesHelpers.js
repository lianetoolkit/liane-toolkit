import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
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
  // console.log(response.headers);
  return response;
};

const EntriesHelpers = {
  getAccountEntries({ campaignId, facebookId, accessToken }) {
    check(campaignId, String);
    check(facebookId, String);
    check(accessToken, String);

    const campaign = Campaigns.findOne(campaignId);
    const isCampaignAccount = !!campaign.accounts.find(
      account => account.facebookId == facebookId
    );

    const accountPath = isCampaignAccount ? "me" : facebookId;

    logger.debug("EntriesHelpers.getAccountEntries called", {
      facebookId
    });

    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api(`${accountPath}/posts`, {
        fields: [
          "object_id",
          "parent_id",
          "message",
          "link",
          "type",
          "created_time",
          "updated_time",
          "shares",
          "comments.limit(1).summary(true)",
          "likes.limit(1).summary(true)"
        ],
        limit: 100
      })
    );

    const _getUpdateObj = ({ entry }) => {
      return {
        $setOnInsert: {
          _id: entry.id,
          facebookAccountId: facebookId,
          createdTime: entry.created_time
        },
        $set: {
          type: entry.type,
          message: entry.message,
          objectId: entry.object_id,
          parentId: entry.parent_id,
          link: entry.link,
          updatedTime: entry.updated_time,
          counts: {
            likes: entry.likes ? entry.likes.summary.total_count : 0,
            comments: entry.comments ? entry.comments.summary.total_count : 0,
            shares: entry.shares ? entry.shares.count : 0
          }
        }
      };
    };

    const _insertWithInteractions = ({ data }) => {
      for (const entry of data) {
        const currentEntry = Entries.findOne(entry.id);
        const updateObj = _getUpdateObj({ entry });
        let updateInteractions = [];
        if (currentEntry) {
          const vals = updateObj.$set;
          if (currentEntry.counts.comments !== vals.counts.comments) {
            updateInteractions.push("comments");
          }
          if (currentEntry.counts.likes !== vals.counts.likes) {
            updateInteractions.push("likes");
          }
        } else {
          updateInteractions = ["comments", "likes"];
        }
        Entries.upsert(
          {
            _id: entry.id
          },
          updateObj
        );
        if (updateInteractions.length) {
          JobsHelpers.addJob({
            jobType: "entries.fetchInteractions",
            jobData: {
              interactionTypes: updateInteractions,
              facebookAccountId: facebookId,
              accessToken: accessToken,
              entryId: entry.id,
              campaignId: campaignId
            }
          });
        }
      }
    };

    const _insertBulk = ({ data }) => {
      const bulk = Entries.rawCollection().initializeUnorderedBulkOp();
      for (const entry of data) {
        bulk
          .find({
            _id: entry.id
          })
          .upsert()
          .update(_getUpdateObj({ entry }));
      }
      bulk.execute();
    };

    if (response.data.length) {
      if (isCampaignAccount) {
        _insertWithInteractions({ data: response.data });
        let next = response.paging.next;
        while (next !== undefined) {
          let nextPage = _fetchFacebookPageData({ url: next });
          next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
          if (nextPage.statusCode == 200 && nextPage.data.data.length) {
            _insertWithInteractions({ data: nextPage.data.data });
          }
        }
      } else {
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
    }

    return;
  },
  getEntryInteractions({
    interactionTypes,
    campaignId,
    facebookAccountId,
    entryId,
    accessToken
  }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    interactionTypes = interactionTypes || ["comments", "likes"];

    logger.debug("EntriesHelpers.getEntryInteractions called", {
      interactionTypes,
      entryId
    });

    if (interactionTypes.indexOf("comments") !== -1) {
      CommentsHelpers.getEntryComments({
        facebookAccountId,
        entryId,
        accessToken,
        campaignId
      });
    }
    if (interactionTypes.indexOf("likes") !== -1) {
      LikesHelpers.getEntryLikes({
        facebookAccountId,
        entryId,
        accessToken,
        campaignId
      });
    }
  }
};

exports.EntriesHelpers = EntriesHelpers;
