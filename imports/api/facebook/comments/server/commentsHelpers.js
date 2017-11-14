import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";
import { HTTP } from "meteor/http";
import _ from "underscore";

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

const CommentsHelpers = {
  getEntryComments({ campaignId, facebookAccountId, entryId, accessToken }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("CommentsHelpers.getEntryComments called", {
      entryId
    });

    _fb.setAccessToken(accessToken);
    const response = Promise.await(
      _fb.api(`${entryId}/comments`, {
        limit: 2000
      })
    );

    const _insertBulk = ({ data }) => {
      const bulk = Comments.rawCollection().initializeUnorderedBulkOp();
      const commentedPeople = [];
      for (const comment of data) {
        if (comment.from) {
          commentedPeople.push(comment.from);
        }
        comment.personId = comment.from.id;
        comment.name = comment.from.name;
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

      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          // do something with result
          if (commentedPeople.length) {
            const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
            for (const people of commentedPeople) {
              const commentsCount = Comments.find({
                personId: people.id,
                facebookAccountId: facebookAccountId
              }).count();
              peopleBulk
                .find({ _id: people.id, campaignId: campaignId })
                .upsert()
                .update({
                  $set: { name: people.name, commentsCount: commentsCount },
                  $addToSet: { facebookAccounts: facebookAccountId }
                });
            }
            peopleBulk.execute((e, result) => {});
          }
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
