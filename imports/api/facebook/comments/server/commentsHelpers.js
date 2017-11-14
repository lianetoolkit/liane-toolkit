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
  getEntryComments({ facebookAccountId, entryId, accessToken }) {
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
        commentedPeople.push(comment.from);
        delete comment.from;
        bulk.insert(comment);
      }

      bulk.execute((e, result) => {
        // do something with result
        console.info("result", result.nInserted);
        if (commentedPeople.length) {
          const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
          for (const people of commentedPeople) {
            peopleBulk
              .find({ _id: people.id })
              .upsert()
              .update({ $set: { name: people.name } });
          }
          peopleBulk.execute(function(e, result) {
            console.info("result", result.nInserted);
          });
        }
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
  }
};

exports.CommentsHelpers = CommentsHelpers;
