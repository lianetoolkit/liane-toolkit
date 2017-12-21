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
  let response;
  try {
    response = HTTP.get(url);
  } catch (error) {
    throw new Meteor.Error(error);
  }
  return response;
};

const EntriesHelpers = {
  updatePeopleCountByEntry({ campaignId, facebookId, entryId }) {
    check(campaignId, String);
    check(facebookId, String);
    check(entryId, String);

    LikesHelpers.updatePeopleLikesCountByEntry({
      campaignId,
      facebookAccountId: facebookId,
      entryId
    });
    CommentsHelpers.updatePeopleCommentsCountByEntry({
      campaignId,
      facebookAccountId: facebookId,
      entryId
    });
  },
  updateAccountEntries({ campaignId, facebookId, accessToken }) {
    check(campaignId, String);
    check(facebookId, String);
    check(accessToken, String);

    let campaign;
    let isCampaignAccount = false;

    if (campaignId) {
      campaign = Campaigns.findOne(campaignId);
      isCampaignAccount = !!campaign.accounts.find(
        account => account.facebookId == facebookId
      );
    }

    const accountPath = isCampaignAccount ? "me" : facebookId;

    logger.debug("EntriesHelpers.updateAccountEntries called", {
      facebookId
    });

    _fb.setAccessToken(accessToken);
    let response;
    try {
      response = Promise.await(
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
    } catch (error) {
      throw new Meteor.Error(error);
    }

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
        const vals = updateObj.$set;
        let updateInteractions = [];
        if (currentEntry) {
          if (
            vals.counts.comments &&
            currentEntry.counts.comments !== vals.counts.comments
          ) {
            updateInteractions.push("comments");
          } else {
            // Update count when interaction update is not scheduled
            // TODO Convert to jobs
            CommentsHelpers.updatePeopleCommentsCountByEntry({
              campaignId,
              facebookAccountId: facebookId,
              entryId: entry.id
            });
          }
          if (
            vals.counts.likes &&
            currentEntry.counts.likes !== vals.counts.likes
          ) {
            updateInteractions.push("likes");
          } else {
            // Update count when interaction update is not scheduled
            // TODO Convert to jobs
            LikesHelpers.updatePeopleLikesCountByEntry({
              campaignId,
              facebookAccountId: facebookId,
              entryId: entry.id
            });
          }
        } else {
          if (vals.counts.likes) updateInteractions.push("likes");
          if (vals.counts.comments) updateInteractions.push("comments");
        }
        Entries.upsert(
          {
            _id: entry.id
          },
          updateObj
        );
        if (updateInteractions.length) {
          JobsHelpers.addJob({
            jobType: "entries.updateEntryInteractions",
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
  updateEntryInteractions({
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

    logger.debug("EntriesHelpers.updateEntryInteractions called", {
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
