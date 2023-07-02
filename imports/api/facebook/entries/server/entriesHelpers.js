import { Promise } from "meteor/promise";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { CampaignsHelpers } from "/imports/api/campaigns/server/campaignsHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
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
  handleWebhook({ facebookAccountId, data }) {
    switch (data.verb) {
      case "add":
        this.upsertEntry({ facebookAccountId, data });
        break;
      case "edited":
        this.upsertEntry({ facebookAccountId, data });
        break;
      default:
    }
  },
  upsertEntry({ facebookAccountId, data }) {
    const campaignWithToken = Campaigns.findOne({
      "facebookAccount.facebookId": facebookAccountId,
    });
    if (!campaignWithToken || !campaignWithToken.facebookAccount.accessToken) {
      throw new Meteor.Error(400, "Facebook account not available");
    }
    if (!data.post_id) {
      return;
    }
    let entry;
    try {
      entry = Promise.await(
        FB.api(data.post_id, {
          fields: [
            "parent_id",
            "message",
            "created_time",
            "updated_time",
            "shares",
            "comments.limit(0).summary(true)",
            "reactions.limit(0).summary(true).as(reaction)",
            "reactions.type(LIKE).limit(0).summary(true).as(like)",
            "reactions.type(CARE).limit(0).summary(true).as(care)",
            "reactions.type(PRIDE).limit(0).summary(true).as(pride)",
            "reactions.type(LOVE).limit(0).summary(true).as(love)",
            "reactions.type(WOW).limit(0).summary(true).as(wow)",
            "reactions.type(HAHA).limit(0).summary(true).as(haha)",
            "reactions.type(SAD).limit(0).summary(true).as(sad)",
            "reactions.type(ANGRY).limit(0).summary(true).as(angry)",
            "reactions.type(THANKFUL).limit(0).summary(true).as(thankful)",
          ],
          access_token: campaignWithToken.facebookAccount.accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    return Entries.upsert(
      {
        _id: entry.id,
      },
      this.getUpdateObjFromFBData({ facebookAccountId, entry })
    );
  },
  updateInteractionCount({ entryId, facebookAccountId }) {
    let entry = Entries.findOne(entryId);
    if (!entry) {
      this.upsertEntry({ facebookAccountId, data: { post_id: entryId } });
      entry = Entries.findOne(entryId);
    }
    let counts = Object.assign({}, entry.counts || {});
    counts.comment = Comments.find({ entryId }).count();
    counts.reaction = Likes.find({
      entryId,
      parentId: { $exists: false },
    }).count();
    const reactionTypes = LikesHelpers.getReactionTypes();
    for (const reactionType of reactionTypes) {
      counts[reactionType.toLowerCase()] = Likes.find({
        entryId,
        type: reactionType,
        parentId: { $exists: false },
      }).count();
    }
    let $set = {};
    for (let type in counts) {
      $set[`counts.${type}`] = counts[type];
    }
    Entries.update(entryId, { $set });
  },
  updatePeopleCountByEntry({ campaignId, facebookId, entryId }) {
    check(campaignId, String);
    check(facebookId, String);
    check(entryId, String);

    LikesHelpers.updatePeopleLikesCountByEntry({
      campaignId,
      facebookAccountId: facebookId,
      entryId,
    });
    CommentsHelpers.updatePeopleCommentsCountByEntry({
      campaignId,
      facebookAccountId: facebookId,
      entryId,
    });
  },
  getUpdateObjFromFBData({ facebookAccountId, entry, source }) {
    let entry_source;
    let entry_message;
    let entry_createdTime;
    let entry_updatedTime;
    let entry_parentId;
    let source_data;
    let counts;

    switch (source) {
      case "instagram":
        counts = {
          share: 0,
          like: entry.like_count ? entry.like_count : 0,
          care: 0,
          love: 0,
          wow: 0,
          haha: 0,
          sad: 0,
          angry: 0,
          thankful: 0,
          reaction: entry.like_count ? entry.like_count : 0,
          comment: entry.comments_count ? entry.comments_count : 0,
        };

        entry_source = source;
        entry_message = entry.caption;
        entry_createdTime = entry.timestamp; // To DO: Verify if entry already exists and keep its original date;
        entry_updatedTime = entry.timestamp;
        entry_parentId = entry.owner.id;
        source_data = {
          ig_id: entry.ig_id,
          media_type: entry.media_type,
          media_url: entry.media_url,
          permalink: entry.permalink,
          username: entry.username,
          is_comment_enabled: entry.is_comment_enabled,
        };
        break;
      default:
        // Facebook
        counts = {
          share: entry.shares ? entry.shares.count : 0,
          like: entry.like ? entry.like.summary.total_count : 0,
          care: entry.care ? entry.care.summary.total_count : 0,
          love: entry.love ? entry.love.summary.total_count : 0,
          wow: entry.wow ? entry.wow.summary.total_count : 0,
          haha: entry.haha ? entry.haha.summary.total_count : 0,
          sad: entry.sad ? entry.sad.summary.total_count : 0,
          angry: entry.angry ? entry.angry.summary.total_count : 0,
          thankful: entry.thankful ? entry.thankful.summary.total_count : 0,
          reaction: entry.reaction ? entry.reaction.summary.total_count : 0,
          comment: entry.comments ? entry.comments.summary.total_count : 0,
        };

        entry_source = "facebook";
        entry_message = entry.message;
        entry_createdTime = entry.created_time;
        entry_updatedTime = entry.updated_time;
        entry_parentId = entry.parent_id;
        source_data = null;
        break;
    }

    return {
      $setOnInsert: {
        _id: entry.id,
        source: entry_source,
        facebookAccountId,
        createdTime: entry_createdTime,
      },
      $set: {
        message: entry_message,
        parentId: entry_parentId,
        updatedTime: entry_updatedTime,
        counts,
        source_data,
      },
    };
  },
  updateInstagramAccountEntries({
    facebookId,
    instagramId,
    accessToken,
    forceUpdate,
    campaignId,
    likeDateEstimate,
  }) {
    check(facebookId, String);
    check(instagramId, String);
    check(accessToken, String);
    check(forceUpdate, Boolean);
    check(campaignId, String);

    logger.debug("EntriesHelpers.updateInstagramAccountEntries called", {
      facebookId,
      instagramId,
    });

    const _insertWithInteractions = ({ data }) => {
      for (const entry of data) {
        const currentEntry = Entries.findOne(entry.id);
        const updateObj = this.getUpdateObjFromFBData({
          facebookAccountId: facebookId,
          entry,
          source: "instagram",
        });
        const vals = updateObj.$set;
        let updateInteractions = [];
        if (currentEntry) {
          if (
            vals.counts.comment &&
            (currentEntry.counts.comment !== vals.counts.comment || forceUpdate)
          ) {
            updateInteractions.push("comments");
          }
          if (
            vals.counts.reaction &&
            (currentEntry.counts.reaction !== vals.counts.reaction ||
              forceUpdate)
          ) {
            updateInteractions.push("likes");
          }
        } else {
          if (vals.counts.reaction) updateInteractions.push("likes");
          if (vals.counts.comment) updateInteractions.push("comments");
        }

        Entries.upsert(
          {
            _id: entry.id,
          },
          updateObj
        );
        if (updateInteractions.length) {
          logger.debug(
            "EntriesHelpers.updateInstagramAccountEntries need to update interactions",
            {
              entry: entry.caption,
              updateInteractions,
            }
          );

          JobsHelpers.addJob({
            jobType: "entries.updateEntryInteractions",
            jobData: {
              likeDateEstimate,
              interactionTypes: updateInteractions,
              facebookAccountId: facebookId,
              accessToken: accessToken,
              entryId: entry.id,
              campaignId: campaignId,
            },
          });
        }
      }
    };

    let response;
    let fields = [
      "caption",
      "comments_count",
      "id",
      "owner",
      "like_count",
      "media_type",
      "media_url",
      "permalink",
      "thumbnail_url",
      "timestamp",
      "is_comment_enabled",
    ];

    // First we search for "media"
    try {
      response = Promise.await(
        FB.api(`${instagramId}/media`, {
          fields,
          limit: 100,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    if (response.data.length) {
      _insertWithInteractions({ data: response.data });
      let next = response.paging.next;
      while (next !== undefined) {
        let nextPage = _fetchFacebookPageData({ url: next });
        next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
        if (nextPage.statusCode == 200 && nextPage.data.data.length) {
          _insertWithInteractions({ data: nextPage.data.data });
        }
      }
    }

    // fields = [
    //   "caption",
    //   "comments_count",
    //   "id",
    //   "owner",
    //   "like_count",
    //   "media_type",
    //   "media_url",
    //   "permalink",
    //   "thumbnail_url",
    //   "timestamp",
    // ];
    // // Then we search for "stories"
    // try {
    //   response = Promise.await(
    //     FB.api(`${instagramId}/stories`, {
    //       fields,
    //       limit: 100,
    //       access_token: accessToken,
    //     })
    //   );
    // } catch (error) {
    //   throw new Meteor.Error(error);
    // }
    //
    // if (response.data.length) {
    //   _insertWithInteractions({ data: response.data });
    //   let next = response.paging.next;
    //   while (next !== undefined) {
    //     let nextPage = _fetchFacebookPageData({ url: next });
    //     next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
    //     if (nextPage.statusCode == 200 && nextPage.data.data.length) {
    //       _insertWithInteractions({ data: nextPage.data.data });
    //     }
    //   }
    // }

    return;
  },
  updateAccountEntries({
    campaignId,
    facebookId,
    likeDateEstimate,
    forceUpdate,
  }) {
    check(campaignId, String);
    check(facebookId, String);
    check(forceUpdate, Boolean);

    CampaignsHelpers.refreshCampaignAccountToken({ campaignId });

    let campaign;
    let isCampaignAccount = false;

    if (campaignId) {
      campaign = Campaigns.findOne(campaignId);
      isCampaignAccount = campaign.facebookAccount.facebookId == facebookId;
    }

    const accessToken = campaign.facebookAccount.accessToken;

    // If configured, we first update instagram entries
    const facebookAccount = FacebookAccountsHelpers.getFacebookAccount({
      facebookId,
    });
    if (facebookAccount.instagramBusinessAccountId) {
      this.updateInstagramAccountEntries({
        facebookId,
        instagramId: facebookAccount.instagramBusinessAccountId,
        accessToken: accessToken,
        forceUpdate,
        campaignId,
        likeDateEstimate,
      });
    }

    const accountPath = isCampaignAccount ? "me" : facebookId;

    let response;
    try {
      response = Promise.await(
        FB.api(`${accountPath}/posts`, {
          fields: [
            "parent_id",
            "message",
            "created_time",
            "updated_time",
            "shares",
            "comments.limit(0).summary(true)",
            "reactions.limit(0).summary(true).as(reaction)",
            "reactions.type(LIKE).limit(0).summary(true).as(like)",
            "reactions.type(CARE).limit(0).summary(true).as(care)",
            "reactions.type(PRIDE).limit(0).summary(true).as(pride)",
            "reactions.type(LOVE).limit(0).summary(true).as(love)",
            "reactions.type(WOW).limit(0).summary(true).as(wow)",
            "reactions.type(HAHA).limit(0).summary(true).as(haha)",
            "reactions.type(SAD).limit(0).summary(true).as(sad)",
            "reactions.type(ANGRY).limit(0).summary(true).as(angry)",
            "reactions.type(THANKFUL).limit(0).summary(true).as(thankful)",
          ],
          limit: 100,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    const _insertWithInteractions = ({ data }) => {
      for (const entry of data) {
        logger.debug("entriesHelpers.updateAccountEntries._insertWithInteractions:", entry);
        const currentEntry = Entries.findOne(entry.id);
        const updateObj = this.getUpdateObjFromFBData({
          facebookAccountId: facebookId,
          entry,
        });
        const vals = updateObj.$set;
        let updateInteractions = [];
        if (currentEntry) {
          if (
            vals.counts.comment &&
            (currentEntry.counts.comment !== vals.counts.comment || forceUpdate)
          ) {
            updateInteractions.push("comments");
          }
          if (
            vals.counts.reaction &&
            (currentEntry.counts.reaction !== vals.counts.reaction ||
              forceUpdate)
          ) {
            updateInteractions.push("likes");
          }
        } else {
          if (vals.counts.reaction) updateInteractions.push("likes");
          if (vals.counts.comment) updateInteractions.push("comments");
        }
        Entries.upsert(
          {
            _id: entry.id,
          },
          updateObj
        );
        if (updateInteractions.length) {
          JobsHelpers.addJob({
            jobType: "entries.updateEntryInteractions",
            jobData: {
              likeDateEstimate,
              interactionTypes: updateInteractions,
              facebookAccountId: facebookId,
              accessToken: accessToken,
              entryId: entry.id,
              campaignId: campaignId,
            },
          });
        }
      }
    };

    const _insertBulk = ({ data }) => {
      const bulk = Entries.rawCollection().initializeUnorderedBulkOp();
      for (const entry of data) {
        logger.debug("entriesHelpers.updateAccountEntries._insertBulk:", entry);
        bulk
          .find({
            _id: entry.id,
          })
          .upsert()
          .update(
            this.getUpdateObjFromFBData({
              facebookAccountId: facebookId,
              entry,
            })
          );
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
    accessToken,
    likeDateEstimate,
  }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);
    check(likeDateEstimate, Boolean);

    interactionTypes = interactionTypes || ["comments", "likes"];

    logger.debug("EntriesHelpers.updateEntryInteractions called", {
      interactionTypes,
      entryId,
    });

    if (interactionTypes.indexOf("comments") !== -1) {
      CommentsHelpers.getEntryComments({
        facebookAccountId,
        entryId,
        accessToken,
        campaignId,
      });
    }
    if (interactionTypes.indexOf("likes") !== -1) {
      LikesHelpers.getObjectReactions({
        facebookAccountId,
        entryId,
        accessToken,
        likeDateEstimate,
      });
    }
  },
  getEntrySource({ entryId }) {
    check(entryId, String);
    let entry = Entries.findOne(entryId);
    return entry.source;
  },
  getEntryData({ entryId }) {
    check(entryId, String);
    let entry = Entries.findOne(entryId);
    return entry;
  },
};

exports.EntriesHelpers = EntriesHelpers;
