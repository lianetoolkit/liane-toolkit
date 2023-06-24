import { Promise } from "meteor/promise";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "/imports/api/facebook/people/server/peopleHelpers.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { EntriesHelpers } from "/imports/api/facebook/entries/server/entriesHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { AccountsLogs } from "/imports/api/accountsLogs/accountsLogs";
import { HTTP } from "meteor/http";
import { Random } from "meteor/random";
import _ from "underscore";

const rawComments = Comments.rawCollection();
rawComments.distinctAsync = Meteor.wrapAsync(rawComments.distinct);
rawComments.aggregateAsync = Meteor.wrapAsync(rawComments.aggregate);

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

const commentsFields = [
  "id",
  "from",
  "message",
  "attachment",
  "message_tags",
  "created_time",
  "can_comment",
  "can_hide",
  "can_remove",
  "can_reply_privately",
  "is_hidden",
  "is_private",
  "comment_count",
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
];

const CommentsHelpers = {
  handleWebhook({ facebookAccountId, data }) {
    switch (data.verb) {
      case "add":
      case "edited":
        this.upsertComment({ facebookAccountId, data });
        break;
      case "remove":
        this.removeComment({ facebookAccountId, data });
        break;
      default:
    }
  },
  handleInstagramWebhook({ instagramBusinessAccountId, data }) {
    logger.debug("handleInstagramWebhook called", {
      instagramBusinessAccountId,
      data,
    });

    const account = FacebookAccountsHelpers.getInstagramAccount({
      instagramBusinessAccountId,
    });
    if (!account) {
      logger.debug(
        "handleInstagramWebhook called with an unknown instagramBusinessAccountId"
      );
      return true;
    }

    const campaign = Campaigns.findOne({
      "facebookAccount.facebookId": account.facebookId,
    });
    if (!campaign) {
      logger.debug(
        "handleInstagramWebhook called with an instagramBusinessAccountId not related to a campaign"
      );
      return true;
    }

    let comment;
    try {
      comment = Promise.await(
        FB.api(data.id, {
          fields: ["id", "media", "text", "username"],
          access_token: campaign.facebookAccount.accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    AccountsLogs.upsert(
      {
        type: "comments.add",
        personId: comment.username,
        objectId: comment.media.id,
        timestamp: new Date().getTime(),
      },
      {
        $setOnInsert: {
          objectType: "comment",
          accountId: account.facebookId,
          isAdmin: false,
          parentId: data.id,
        },
      }
    );

    this.getInstagramEntryComments({
      facebookAccountId: account.facebookId,
      entryId: comment.media.id,
      accessToken: campaign.facebookAccount.accessToken,
      campaignId: campaign._id,
    });
  },
  upsertComment({ facebookAccountId, data }) {
    const campaignWithToken = Campaigns.findOne({
      "facebookAccount.facebookId": facebookAccountId,
    });
    if (!campaignWithToken || !campaignWithToken.facebookAccount.accessToken) {
      throw new Meteor.Error(400, "Facebook account not available");
    }
    let comment;
    try {
      comment = Promise.await(
        FB.api(data.comment_id, {
          fields: commentsFields,
          access_token: campaignWithToken.facebookAccount.accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }
    if (comment.parent_id && comment.parent_id !== comment.post_id) {
      comment.parentId = data.parent_id;
      // Refetch parent comment
      this.upsertComment({
        facebookAccountId,
        data: {
          comment_id: comment.parent_id,
          post_id: comment.post_id,
          adminReplied: comment.from
            ? comment.from.id == facebookAccountId
            : false,
        },
      });
    }
    let from;
    if (comment.from) {
      from = { ...comment.from };
      comment.personId = from.id;
    }
    if (data.post_id) {
      comment.entryId = data.post_id;
    }
    comment.facebookAccountId = facebookAccountId;
    comment.reaction_count = this.getReactionCountFromFBData({ comment });
    comment.lastValidation = new Date();
    delete comment.id;
    delete comment.from;

    // Remove raw reaction count
    delete comment.reaction;
    delete comment.like;
    delete comment.care;
    delete comment.pride;
    delete comment.love;
    delete comment.wow;
    delete comment.haha;
    delete comment.sad;
    delete comment.angry;
    delete comment.thankful;

    Comments.upsert({ _id: data.comment_id }, { $set: comment });

    AccountsLogs.upsert(
      {
        type: `comments.${data.verb || "add"}`,
        personId: comment.personId,
        objectId: data.comment_id,
        timestamp: new Date(comment.created_time).getTime(),
      },
      {
        $setOnInsert: {
          objectType: "comment",
          accountId: facebookAccountId,
          isAdmin: comment.personId == facebookAccountId,
          parentId: comment.parentId || comment.entryId,
        },
      }
    );

    // Update adminReplied if comment does not have it already
    if (data.hasOwnProperty("adminReplied")) {
      Comments.update(
        {
          _id: data.comment_id,
          adminReplied: { $ne: true },
        },
        { $set: { adminReplied: data.adminReplied } }
      );
    }

    // Update entry interaction count
    if (data.post_id) {
      try {
        EntriesHelpers.updateInteractionCount({
          entryId: data.post_id,
          facebookAccountId,
        });
      } catch (e) {
        logger.debug("Entry update failed", e);
      }
    }

    // Upsert person
    if (comment.personId) {
      const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
        facebookId: facebookAccountId,
      });
      const query = {
        personId: comment.personId,
        facebookAccountId,
      };
      const hasPrivateReply = !!Comments.findOne({
        ...query,
        can_reply_privately: true,
      });
      let set = {
        lastValidation: new Date(),
        updatedAt: new Date(),
      };

      const counts = PeopleHelpers.getInteractionCount({
        sourceId: comment.personId,
        facebookAccountId,
        source: "facebook",
      });
      set["counts.facebook"] = counts.facebook;
      set["counts.instagram"] = counts.instagram;
      set["counts.comments"] = counts.comments;

      set["facebookAccountId"] = facebookAccountId;

      let addToSet = {
        facebookAccounts: facebookAccountId,
      };
      let pull = {};

      if (hasPrivateReply) {
        addToSet["canReceivePrivateReply"] = facebookAccountId;
      } else {
        pull["canReceivePrivateReply"] = facebookAccountId;
      }

      // Build update obj
      let updateObj = {
        $setOnInsert: {
          createdAt: new Date(),
          source: "facebook",
          name: from.name,
        },
        $set: set,
      };

      if (comment.created_time) {
        updateObj.$max = {
          lastInteractionDate: new Date(comment.created_time),
        };
      }
      if (Object.keys(addToSet).length) {
        updateObj.$addToSet = addToSet;
      }
      if (Object.keys(pull).length) {
        updateObj.$pull = pull;
      }

      const PeopleRawCollection = People.rawCollection();
      for (const campaign of accountCampaigns) {
        const person = People.findOne({
          campaignId: campaign._id,
          facebookId: comment.personId,
        });
        if (person) {
          PeopleRawCollection.update({ _id: person._id }, updateObj);
        } else {
          const _id = Random.id();

          Promise.await(
            PeopleRawCollection.update(
              {
                campaignId: campaign._id,
                facebookId: comment.personId,
              },
              {
                ...updateObj,
                $setOnInsert: {
                  ...updateObj.$setOnInsert,
                  _id,
                  formId: PeopleHelpers.generateFormId(_id),
                },
              },
              {
                multi: false,
                upsert: true,
              }
            )
          );
          PeopleHelpers.registerDuplicates({
            personId: _id,
            source: "comments",
          });
          AccountsLogs.insert({
            type: "people.new",
            accountId: facebookAccountId,
            personId: comment.personId,
            timestamp: new Date(comment.created_time).getTime(),
          });
        }
      }
    }

    return true;
  },
  removeComment({ facebookAccountId, data }) {
    let commentId;
    if (typeof data == "string") {
      commentId = data;
    } else {
      commentId = data.comment_id || data._id;
    }

    if (!commentId) return;

    const comment = Comments.findOne(commentId);

    if (!comment) return;

    // Remove comment replies
    if (comment.comment_count > 0) {
      const replies = Comments.find({ parentId: comment._id }).fetch();
      if (replies) {
        for (let reply of replies) {
          this.removeComment({
            facebookAccountId,
            data: {
              comment_id: reply._id,
              post_id: reply.entryId,
              from: {
                id: reply.personId,
                name: reply.name,
              },
            },
          });
        }
      }
    }

    Comments.remove(comment._id);

    AccountsLogs.upsert(
      {
        type: "comments.remove",
        objectId: comment._id,
        personId: comment.personId,
      },
      {
        $setOnInsert: {
          accountId: comment.facebookAccountId,
          objectType: "comment",
          timestamp: data.created_time ? data.created_time * 1000 : Date.now(),
        },
      }
    );

    // Update entry
    try {
      EntriesHelpers.updateInteractionCount({ entryId: comment.entryId });
    } catch (e) {
      logger.debug("Entry update failed", e);
    }

    // Update person
    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId,
    });
    for (const campaign of accountCampaigns) {
      const counts = PeopleHelpers.getInteractionCount({
        sourceId: comment.personId,
        facebookAccountId,
        source: "facebook",
      });
      const set = {
        "counts.facebook": counts.facebook,
        "counts.instagram": counts.instagram,
        "counts.comments": counts.comments,
      };
      People.update(
        {
          campaignId: campaign._id,
          facebookId: comment.personId,
        },
        {
          $set: set,
        }
      );
    }
  },
  updatePeopleCommentsCountByEntry({ facebookAccountId, entryId }) {
    check(facebookAccountId, String);
    check(entryId, String);

    const commentedPeople = Comments.find({
      facebookAccountId,
      entryId,
    }).map((comment) => {
      return {
        id: comment.personId,
        name: comment.name,
      };
    });

    if (commentedPeople.length) {
      this.updatePeopleCommentsCount({
        facebookAccountId,
        commentedPeople,
      });
    }
  },
  updatePeopleCommentsCount({ facebookAccountId, commentedPeople, source }) {
    check(facebookAccountId, String);

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId,
    });

    const people = {};
    for (const person of commentedPeople) {
      if (!people[person.id]) {
        people[person.id] = {
          name: person.name,
          lastComment: person.comment,
        };
      }
    }

    if (commentedPeople.length) {
      const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
      for (const personId in people) {
        const commentedPerson = people[personId];
        const query = {
          personId: personId,
          facebookAccountId: facebookAccountId,
        };

        const commentsCount = Comments.find(query).count();
        const hasPrivateReply = !!Comments.findOne({
          ...query,
          can_reply_privately: true,
        });
        let set = {
          lastValidation: new Date(),
          updatedAt: new Date(),
        };
        set["name"] = commentedPerson.name;
        set["counts.comments"] = commentsCount;
        set["facebookAccountId"] = facebookAccountId;

        const counts = PeopleHelpers.getInteractionCount({
          sourceId: personId,
          facebookAccountId,
          source: source || "facebook",
        });
        set["counts.facebook"] = counts.facebook;
        set["counts.instagram"] = counts.instagram;
        set["counts.comments"] = counts.comments;

        let addToSet = {
          facebookAccounts: facebookAccountId,
        };
        let pull = {};

        if (hasPrivateReply) {
          addToSet["canReceivePrivateReply"] = facebookAccountId;
        } else {
          pull["canReceivePrivateReply"] = facebookAccountId;
        }

        // Build update obj
        let updateObj;
        switch (source) {
          case "instagram":
            updateObj = {
              $setOnInsert: {
                createdAt: new Date(),
                source: "instagram",
                campaignMeta: {
                  social_networks: {
                    instagram:
                      "@" + commentedPerson.lastComment.source_data.username,
                  },
                },
              },
              $set: set,
            };
            break;
          default:
            updateObj = {
              $setOnInsert: {
                createdAt: new Date(),
                source: "facebook",
              },
              $set: set,
            };
            break;
        }

        if (Object.keys(addToSet).length) {
          updateObj.$addToSet = addToSet;
        }
        if (Object.keys(pull).length) {
          updateObj.$pull = pull;
        }
        updateObj.$max = {
          lastInteractionDate: new Date(
            commentedPerson.lastComment.created_time
          ),
        };

        for (const campaign of accountCampaigns) {
          const _id = Random.id();
          peopleBulk
            .find({
              campaignId: campaign._id,
              facebookId: personId,
            })
            .upsert()
            .update({
              ...updateObj,
              $setOnInsert: {
                ...updateObj.$setOnInsert,
                _id,
                formId: PeopleHelpers.generateFormId(_id),
              },
            });
        }
      }
      peopleBulk.execute();
    }
  },
  getInstagramCommentReplies({ commentId, accessToken }) {
    let instagramCommentReplyFields = [
      "id",
      "hidden",
      "like_count",
      "media",
      "text",
      "user",
      "timestamp",
      "username",
    ];

    let response,
      replies = [];
    try {
      response = Promise.await(
        FB.api(`${commentId}/replies`, {
          fields: instagramCommentReplyFields,
          limit: 1000,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }
    if (response.data.length) {
      replies = replies.concat(response.data);
      let next = response.paging ? response.paging.next : undefined;
      while (next !== undefined) {
        let nextPage = _fetchFacebookPageData({ url: next });
        next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
        if (nextPage.statusCode == 200 && nextPage.data.data.length) {
          replies = replies.concat(nextPage.data.data);
        }
      }
    }
    return replies;
  },
  getCommentReplies({ commentId, accessToken }) {
    let response,
      comments = [];
    try {
      response = Promise.await(
        FB.api(`${commentId}/comments`, {
          fields: commentsFields,
          limit: 1000,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }
    if (response.data.length) {
      comments = comments.concat(response.data);
      let next = response.paging.next;
      while (next !== undefined) {
        let nextPage = _fetchFacebookPageData({ url: next });
        next = nextPage.data.paging ? nextPage.data.paging.next : undefined;
        if (nextPage.statusCode == 200 && nextPage.data.data.length) {
          comments = comments.concat(nextPage.data.data);
        }
      }
    }
    return comments;
  },
  getReactionCountFromFBData({ comment, source }) {
    logger.debug("CommentsHelpers.getReactionCountFromFBData called", {
      comment_id: comment.id,
      source,
    });

    let reaction_count;

    switch (source) {
      case "instagram":
        reaction_count = {
          like: comment.like_count || 0,
          care: 0,
          pride: 0,
          love: 0,
          wow: 0,
          haha: 0,
          sad: 0,
          angry: 0,
          thankful: 0,
          reaction: comment.like_count,
        };
        break;
      default:
        // Facebook
        reaction_count = {
          like: comment.like ? comment.like.summary.total_count : 0,
          care: comment.care ? comment.care.summary.total_count : 0,
          pride: comment.pride ? comment.pride.summary.total_count : 0,
          love: comment.love ? comment.love.summary.total_count : 0,
          wow: comment.wow ? comment.wow.summary.total_count : 0,
          haha: comment.haha ? comment.haha.summary.total_count : 0,
          sad: comment.sad ? comment.sad.summary.total_count : 0,
          angry: comment.angry ? comment.angry.summary.total_count : 0,
          thankful: comment.thankful ? comment.thankful.summary.total_count : 0,
          reaction: comment.reaction ? comment.reaction.summary.total_count : 0,
        };
        break;
    }

    return reaction_count;
  },
  getInstagramEntryComments({
    facebookAccountId,
    entryId,
    accessToken,
    campaignId,
  }) {
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);
    check(campaignId, String);

    logger.debug("CommentsHelpers.getInstagramEntryComments called", {
      entryId,
    });

    const facebookAccount = FacebookAccountsHelpers.getFacebookAccount({
      facebookAccountId,
    });
    const instagramBusinessAccountId =
      facebookAccount.instagramBusinessAccountId;

    let commentedPeople = [];

    const addCommentToBulk = ({ comment, bulk }) => {
      if (!comment.username) return;
      comment.source = "instagram";
      comment.name = PeopleHelpers.getPersonName({
        campaignId,
        instagramHandle: comment.username,
      });
      let parentEntryData = EntriesHelpers.getEntryData({
        entryId: comment.media.id,
      });
      comment.can_comment =
        parentEntryData && parentEntryData.source_data
          ? parentEntryData.source_data.is_comment_enabled
          : false;
      comment.personId = PeopleHelpers.getPersonId({
        campaignId,
        instagramHandle: comment.username,
      });
      comment.entryId = entryId;
      comment.facebookAccountId = facebookAccountId;
      comment.created_time = comment.timestamp;
      comment.is_hidden = comment.hidden;
      comment.comment_count = comment.replies ? comment.replies.data.length : 0;
      comment.reaction_count = this.getReactionCountFromFBData({
        comment,
        source: "instagram",
      });
      let source_data = {};
      source_data.username = comment.username;
      if (comment.media) {
        source_data.media_id = comment.media.id;
      }
      if (comment.user) {
        source_data.user_id = comment.user.id;
      }
      comment.source_data = source_data;
      comment.message = comment.text ? comment.text : "";
      const commentId = comment.id;
      delete comment.id;
      delete comment.username;
      delete comment.timestamp;
      delete comment.hidden;
      delete comment.like_count;
      delete comment.media;
      delete comment.user;
      delete comment.text;

      commentedPeople.push({
        id: comment.personId,
        name: comment.name,
        comment,
      });

      if (comment.reaction_count && comment.reaction_count.reaction > 0) {
        LikesHelpers.handleCommentsReactions({
          facebookAccountId,
          entryId,
          commentId,
          accessToken,
        });
      }
      bulk.find({ _id: commentId }).upsert().update({
        $set: comment,
      });
    };

    const _insertBulk = ({ data }) => {
      const bulk = Comments.rawCollection().initializeUnorderedBulkOp();
      for (const comment of data) {
        if (
          comment.username &&
          comment.replies &&
          comment.replies.data.length > 0
        ) {
          const replies = this.getInstagramCommentReplies({
            commentId: comment.id,
            accessToken,
          });
          comment.adminReplied =
            replies.findIndex((c) =>
              c.user ? c.user.id == instagramBusinessAccountId : false
            ) != -1;
          for (const reply of replies) {
            addCommentToBulk({
              comment: {
                ...reply,
                parentId: comment.id,
              },
              bulk,
            });
          }
        }
        addCommentToBulk({ comment, bulk });
      }

      if (commentedPeople.length) {
        bulk.execute(
          Meteor.bindEnvironment((e, result) => {
            this.updatePeopleCommentsCount({
              facebookAccountId,
              commentedPeople,
              source: "instagram",
            });
          })
        );
      }
    };

    let instagramCommentFields = [
      "id",
      "hidden",
      "like_count",
      "media",
      "text",
      "user",
      "timestamp",
      "username",
      "replies",
    ];

    let response;
    try {
      response = Promise.await(
        FB.api(`${entryId}/comments`, {
          fields: instagramCommentFields,
          limit: 1000,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    if (response.data.length) {
      _insertBulk({ data: response.data });
      let next = response.paging ? response.paging.next : undefined;
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
  getEntryComments({ facebookAccountId, entryId, accessToken, campaignId }) {
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);
    check(campaignId, String);

    logger.debug("CommentsHelpers.getEntryComments called", {
      entryId,
    });

    switch (EntriesHelpers.getEntrySource({ entryId })) {
      case "instagram":
        return this.getInstagramEntryComments({
          facebookAccountId,
          entryId,
          accessToken,
          campaignId,
        });
      default:
        // Facebook
        // do nothing here, facebook is the default behaviour of this function
        break;
    }

    let commentedPeople = [];

    const addCommentToBulk = ({ comment, bulk }) => {
      if (!comment.from) return;
      commentedPeople.push({ ...comment.from, comment });
      comment.personId = comment.from.id;
      comment.name = comment.from.name;
      comment.entryId = entryId;
      comment.facebookAccountId = facebookAccountId;
      comment.reaction_count = this.getReactionCountFromFBData({ comment });
      const commentId = comment.id;
      delete comment.id;
      delete comment.from;
      // Remove raw reaction count
      delete comment.reaction;
      delete comment.like;
      delete comment.care;
      delete comment.pride;
      delete comment.love;
      delete comment.wow;
      delete comment.haha;
      delete comment.sad;
      delete comment.angry;
      delete comment.thankful;
      if (comment.reaction_count && comment.reaction_count.reaction > 0) {
        LikesHelpers.handleCommentsReactions({
          facebookAccountId,
          entryId,
          commentId,
          accessToken,
        });
      }
      bulk.find({ _id: commentId }).upsert().update({
        $set: comment,
      });
    };

    const _insertBulk = ({ data }) => {
      const bulk = Comments.rawCollection().initializeUnorderedBulkOp();
      for (const comment of data) {
        if (comment.from && comment.comment_count > 0) {
          const replies = this.getCommentReplies({
            commentId: comment.id,
            accessToken,
          });
          comment.adminReplied =
            replies.findIndex((c) =>
              c.from ? c.from.id == facebookAccountId : false
            ) != -1;
          for (const reply of replies) {
            addCommentToBulk({
              comment: {
                ...reply,
                parentId: comment.id,
              },
              bulk,
            });
          }
        }
        addCommentToBulk({ comment, bulk });
      }

      if (commentedPeople.length) {
        bulk.execute(
          Meteor.bindEnvironment((e, result) => {
            this.updatePeopleCommentsCount({
              facebookAccountId,
              commentedPeople,
            });
          })
        );
      }
    };

    let response;
    try {
      response = Promise.await(
        FB.api(`${entryId}/comments`, {
          fields: commentsFields,
          limit: 1000,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    if (response.data.length) {
      _insertBulk({ data: response.data });
      let next = response.paging?.next;
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
};

exports.CommentsHelpers = CommentsHelpers;
