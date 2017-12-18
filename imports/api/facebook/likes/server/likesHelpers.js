import { Promise } from "meteor/promise";
import { Facebook, FacebookApiException } from "fb";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { People } from "/imports/api/facebook/people/people.js";
import { HTTP } from "meteor/http";
import { Random } from "meteor/random";

const options = {
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

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

const LikesHelpers = {
  getEntryLikes({ campaignId, facebookAccountId, entryId, accessToken }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("LikesHelpers.getEntryLikes called", {
      entryId
    });

    _fb.setAccessToken(accessToken);
    let response;
    try {
      response = Promise.await(
        _fb.api(`${entryId}/reactions`, {
          limit: 1000
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    logger.debug("LikesHelpers.getEntryLikes response", { response });

    const _insertBulk = ({ data }) => {
      const bulk = Likes.rawCollection().initializeUnorderedBulkOp();
      const likedPeople = [];
      for (const like of data) {
        likedPeople.push({ id: like.id, name: like.name });
        like.facebookAccountId = facebookAccountId;
        const personId = like.id;
        delete like.id;
        bulk
          .find({ personId, entryId })
          .upsert()
          .update({
            $setOnInsert: {
              _id: Random.id(),
              personId,
              entryId
            },
            $set: like
          });
      }

      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          if (likedPeople.length) {
            const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
            for (const people of likedPeople) {
              const likesCount = Likes.find({
                personId: people.id,
                facebookAccountId: facebookAccountId
              }).count();
              peopleBulk
                .find({ facebookId: people.id, campaignId: campaignId })
                .upsert()
                .update({
                  $setOnInsert: { _id: Random.id() },
                  $set: { name: people.name, likesCount: likesCount },
                  $addToSet: { facebookAccounts: facebookAccountId }
                });
            }
            peopleBulk.execute(function(e, result) {});
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

exports.LikesHelpers = LikesHelpers;
