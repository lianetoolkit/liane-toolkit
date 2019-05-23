import { Promise } from "meteor/promise";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "/imports/api/facebook/people/server/peopleHelpers.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
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

const CommentsHelpers = {
  handleWebhook({ facebookAccountId, data }) {
    switch (data.verb) {
      case "add":
        this.upsertComment({ facebookAccountId, data });
        break;
      case "edited":
        this.upsertComment({ facebookAccountId, data });
        break;
      default:
    }
  },
  upsertComment({ facebookAccountId, data }) {
    const campaignWithToken = Campaigns.findOne({
      "facebookAccount.facebookId": facebookAccountId
    });
    if (!campaignWithToken || !campaignWithToken.facebookAccount.accessToken) {
      throw new Meteor.Error(400, "Facebook account not available");
    }
    let comment;
    try {
      comment = Promise.await(
        FB.api(data.comment_id, {
          fields: [
            "id",
            "from",
            "message",
            "attachment",
            "message_tags",
            "can_hide",
            "can_remove",
            "can_reply_privately",
            "is_hidden",
            "is_private",
            "comment_count",
            "reactions.limit(0).summary(total_count)",
            "created_time"
          ],
          access_token: campaignWithToken.facebookAccount.accessToken
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }
    if (data.parent_id && data.parent_id !== data.post_id) {
      comment.parentId = data.parent_id;
      // Refetch parent comment
      this.upsertComment({
        facebookAccountId,
        data: {
          comment_id: data.parent_id,
          post_id: data.post_id
        }
      });
    }
    const from = comment.from;
    comment.personId = from.id;
    comment.entryId = data.post_id;
    comment.facebookAccountId = facebookAccountId;
    comment.reaction_count = comment.reactions.summary.total_count;
    delete comment.id;
    delete comment.from;
    delete comment.reaction_count;
    Comments.upsert({ _id: data.comment_id }, { $set: comment });

    // Upsert person
    if (comment.personId) {
      const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
        facebookId: facebookAccountId
      });
      const query = {
        personId: comment.personId,
        facebookAccountId
      };
      const hasPrivateReply = !!Comments.findOne({
        ...query,
        can_reply_privately: true
      });
      let set = {
        updatedAt: new Date()
      };
      set["counts"] = PeopleHelpers.getInteractionCount({
        facebookId: comment.personId,
        facebookAccountId
      });
      set["facebookAccountId"] = facebookAccountId;

      let addToSet = {
        facebookAccounts: facebookAccountId
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
          name: from.name
        },
        $set: set
      };

      if (comment.created_time) {
        updateObj.$max = {
          lastInteractionDate: new Date(comment.created_time)
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
        PeopleRawCollection.update(
          {
            campaignId: campaign._id,
            facebookId: comment.personId
          },
          {
            ...updateObj,
            $setOnInsert: {
              ...updateObj.$setOnInsert,
              _id: Random.id()
            }
          },
          {
            upsert: true,
            multi: false
          }
        );
      }
    }

    return true;
  },
  updatePeopleCommentsCountByEntry({ facebookAccountId, entryId }) {
    check(facebookAccountId, String);
    check(entryId, String);

    const commentedPeople = Comments.find({
      facebookAccountId,
      entryId
    }).map(comment => {
      return {
        id: comment.personId,
        name: comment.name
      };
    });

    if (commentedPeople.length) {
      this.updatePeopleCommentsCount({
        facebookAccountId,
        commentedPeople
      });
    }
  },
  updatePeopleCommentsCount({ facebookAccountId, commentedPeople }) {
    check(facebookAccountId, String);

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId
    });

    if (commentedPeople.length) {
      const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
      for (const commentedPerson of commentedPeople) {
        const query = {
          personId: commentedPerson.id,
          facebookAccountId: facebookAccountId
        };
        const commentsCount = Comments.find(query).count();
        const hasPrivateReply = !!Comments.findOne({
          ...query,
          can_reply_privately: true
        });
        let set = {
          updatedAt: new Date()
        };
        set["name"] = commentedPerson.name;
        set["counts.comments"] = commentsCount;
        set["facebookAccountId"] = facebookAccountId;

        let addToSet = {
          facebookAccounts: facebookAccountId
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
            source: "facebook"
          },
          $set: set
        };

        if (commentedPerson.comment.created_time) {
          updateObj.$max = {
            lastInteractionDate: new Date(
              commentedPerson.comment.created_time || 0
            )
          };
        }
        if (Object.keys(addToSet).length) {
          updateObj.$addToSet = addToSet;
        }
        if (Object.keys(pull).length) {
          updateObj.$pull = pull;
        }

        for (const campaign of accountCampaigns) {
          peopleBulk
            .find({
              campaignId: campaign._id,
              facebookId: commentedPerson.id
            })
            .upsert()
            .update({
              ...updateObj,
              $setOnInsert: {
                ...updateObj.$setOnInsert,
                _id: Random.id()
              }
            });
        }
      }
      peopleBulk.execute();
    }
  },
  getCommentReplies({ commentId, accessToken }) {
    let response,
      comments = [];
    try {
      response = Promise.await(
        FB.api(`${commentId}/comments`, {
          fields: [
            "id",
            "from",
            "message",
            "attachment",
            "message_tags",
            "can_hide",
            "can_remove",
            "can_reply_privately",
            "is_hidden",
            "is_private",
            "comment_count",
            "reactions.limit(0).summary(total_count)",
            "created_time"
          ],
          limit: 1000,
          access_token: accessToken
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
  getEntryComments({ facebookAccountId, entryId, accessToken }) {
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("CommentsHelpers.getEntryComments called", {
      entryId
    });

    let commentedPeople = [];

    const addCommentToBulk = ({ comment, bulk }) => {
      if (comment.from) {
        commentedPeople.push({ ...comment.from, comment });
        comment.personId = comment.from.id;
        comment.name = comment.from.name;
        comment.entryId = entryId;
        comment.facebookAccountId = facebookAccountId;
        comment.reaction_count = comment.reactions.summary.total_count;
        const commentId = comment.id;
        delete comment.id;
        delete comment.from;
        delete comment.reactions;
        if (comment.reaction_count && comment.reaction_count > 0) {
          LikesHelpers.handleCommentsReactions({
            facebookAccountId,
            entryId,
            commentId,
            accessToken
          });
        }
        bulk
          .find({ _id: commentId })
          .upsert()
          .update({
            $set: comment
          });
      }
    };

    const _insertBulk = ({ data }) => {
      const bulk = Comments.rawCollection().initializeUnorderedBulkOp();
      for (const comment of data) {
        if (comment.comment_count > 0) {
          const replies = this.getCommentReplies({
            commentId: comment.id,
            accessToken
          });
          for (const reply of replies) {
            addCommentToBulk({
              comment: {
                ...reply,
                parentId: comment.id
              },
              bulk
            });
          }
        }
        addCommentToBulk({ comment, bulk });
      }

      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          this.updatePeopleCommentsCount({
            facebookAccountId,
            commentedPeople
          });
        })
      );
    };

    let response;
    try {
      response = Promise.await(
        FB.api(`${entryId}/comments`, {
          fields: [
            "id",
            "from",
            "message",
            "attachment",
            "message_tags",
            "can_hide",
            "can_remove",
            "can_reply_privately",
            "is_hidden",
            "is_private",
            "comment_count",
            "reactions.limit(0).summary(total_count)",
            "created_time"
          ],
          limit: 1000,
          access_token: accessToken
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

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
  }
};

exports.CommentsHelpers = CommentsHelpers;
