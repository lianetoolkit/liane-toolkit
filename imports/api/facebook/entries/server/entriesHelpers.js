import { Promise } from "meteor/promise";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

import { HTTP } from "meteor/http";

const _fetchFacebookPageData = ({ url }) => {
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

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId
    });

    const accountPath = isCampaignAccount ? "me" : facebookId;

    logger.debug("EntriesHelpers.updateAccountEntries called", {
      facebookId
    });

    let response;
    try {
      response = Promise.await(
        FB.api(`${accountPath}/posts`, {
          fields: [
            "object_id",
            "parent_id",
            "message",
            "link",
            "type",
            "created_time",
            "updated_time",
            "shares",
            "comments.limit(0).summary(true)",
            "reactions.limit(0).summary(true).as(reaction)",
            "reactions.type(LIKE).limit(0).summary(true).as(like)",
            "reactions.type(LOVE).limit(0).summary(true).as(love)",
            "reactions.type(WOW).limit(0).summary(true).as(wow)",
            "reactions.type(HAHA).limit(0).summary(true).as(haha)",
            "reactions.type(SAD).limit(0).summary(true).as(sad)",
            "reactions.type(ANGRY).limit(0).summary(true).as(angry)",
            "reactions.type(THANKFUL).limit(0).summary(true).as(thankful)"
          ],
          limit: 100,
          access_token: accessToken
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    const _getUpdateObj = ({ entry }) => {
      const counts = {
        share: entry.shares ? entry.shares.count : 0,
        like: entry.like ? entry.like.summary.total_count : 0,
        love: entry.love ? entry.love.summary.total_count : 0,
        wow: entry.wow ? entry.wow.summary.total_count : 0,
        haha: entry.haha ? entry.haha.summary.total_count : 0,
        sad: entry.sad ? entry.sad.summary.total_count : 0,
        angry: entry.angry ? entry.angry.summary.total_count : 0,
        thankful: entry.thankful ? entry.thankful.summary.total_count : 0,
        reaction: entry.reaction ? entry.reaction.summary.total_count : 0,
        comment: entry.comments ? entry.comments.summary.total_count : 0
      };
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
          counts
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
            vals.counts.comment &&
            currentEntry.counts.comment !== vals.counts.comment
          ) {
            updateInteractions.push("comments");
          } else {
            // Update count when interaction update is not scheduled
            if (accountCampaigns.length > 1) {
              JobsHelpers.addJob({
                jobType: "entries.updatePeopleCommentsCount",
                jobData: {
                  campaignId,
                  facebookAccountId: facebookId,
                  entryId: entry.id
                }
              });
            }
          }
          if (
            vals.counts.reaction &&
            currentEntry.counts.reaction !== vals.counts.reaction
          ) {
            updateInteractions.push("likes");
          } else {
            // Update count when interaction update is not scheduled
            if (accountCampaigns.length > 1) {
              JobsHelpers.addJob({
                jobType: "entries.updatePeopleLikesCount",
                jobData: {
                  campaignId,
                  facebookAccountId: facebookId,
                  entryId: entry.id
                }
              });
            }
          }
        } else {
          if (vals.counts.reaction) updateInteractions.push("likes");
          if (vals.counts.comment) updateInteractions.push("comments");
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
