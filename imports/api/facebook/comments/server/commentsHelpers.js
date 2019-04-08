import { Promise } from "meteor/promise";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";
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
  updatePeopleCommentsCountByEntry({ campaignId, facebookAccountId, entryId }) {
    check(campaignId, String);
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
        campaignId,
        facebookAccountId,
        commentedPeople
      });
    }
  },
  updatePeopleCommentsCount({
    campaignId,
    facebookAccountId,
    commentedPeople
  }) {
    check(campaignId, String);
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
            createdAt: new Date()
          },
          $set: set,
          $max: {
            lastInteractionDate: new Date(
              commentedPerson.comment.created_time || 0
            )
          }
        };
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

      // for (const campaign of accountCampaigns) {
      //   for (const commentedPerson of commentedPeople) {
      //     JobsHelpers.addJob({
      //       jobType: "people.sumPersonInteractions",
      //       jobData: {
      //         campaignId: campaign._id,
      //         facebookId: commentedPerson.id
      //       }
      //     });
      //   }
      // }
    }
  },
  getEntryComments({ campaignId, facebookAccountId, entryId, accessToken }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("CommentsHelpers.getEntryComments called", {
      entryId
    });

    let response;
    try {
      response = Promise.await(
        FB.api(`${entryId}/comments`, {
          fields: [
            "id",
            "from",
            "message",
            "message_tags",
            "comment_count",
            "like_count",
            "created_time",
            "can_reply_privately"
          ],
          limit: 1000,
          access_token: accessToken
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    const _insertBulk = ({ data }) => {
      const bulk = Comments.rawCollection().initializeUnorderedBulkOp();
      const commentedPeople = [];
      for (const comment of data) {
        if (comment.from) {
          commentedPeople.push({ ...comment.from, comment });
          comment.personId = comment.from.id;
          comment.name = comment.from.name;
          comment.entryId = entryId;
          comment.facebookAccountId = facebookAccountId;
          const commentId = comment.id;
          delete comment.id;
          delete comment.from;
          bulk
            .find({ _id: commentId })
            .upsert()
            .update({
              $set: comment
            });
        }
      }

      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          this.updatePeopleCommentsCount({
            campaignId,
            facebookAccountId,
            commentedPeople
          });
        })
      );
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
  }
};

exports.CommentsHelpers = CommentsHelpers;
