import { Promise } from "meteor/promise";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { People } from "/imports/api/facebook/people/people.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { HTTP } from "meteor/http";
import { Random } from "meteor/random";

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

const rawLikes = Likes.rawCollection();
rawLikes.distinctAsync = Meteor.wrapAsync(rawLikes.distinct);

const LikesHelpers = {
  getReactionTypes() {
    return ["NONE", "LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY", "THANKFUL"];
  },
  updatePeopleLikesCountByEntry({ campaignId, facebookAccountId, entryId }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);

    const likedPeople = Likes.find({
      facebookAccountId,
      entryId
    }).map(like => {
      return {
        id: like.personId,
        name: like.name
      };
    });

    if (likedPeople.length) {
      this.updatePeopleLikesCount({
        campaignId,
        facebookAccountId,
        likedPeople
      });
    }
  },
  updatePeopleLikesCount({ campaignId, facebookAccountId, likedPeople }) {
    check(campaignId, String);
    check(facebookAccountId, String);

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId
    });

    if (likedPeople.length) {
      const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
      for (const likedPerson of likedPeople) {
        const likesCount = Likes.find({
          personId: likedPerson.id,
          facebookAccountId: facebookAccountId
        }).count();
        let reactionsCount = {};
        const reactionTypes = this.getReactionTypes();
        for (const reactionType of reactionTypes) {
          reactionsCount[reactionType.toLowerCase()] = Likes.find({
            personId: likedPerson.id,
            facebookAccountId: facebookAccountId,
            type: reactionType
          }).count();
        }
        let set = {
          updatedAt: new Date()
        };
        set["name"] = likedPerson.name;
        set[`counts.${facebookAccountId}.likes`] = likesCount;
        set[`counts.${facebookAccountId}.reactions`] = reactionsCount;
        peopleBulk
          .find({
            campaignId: { $in: accountCampaigns.map(campaign => campaign._id) },
            facebookId: likedPerson.id
          })
          .upsert()
          .update(
            {
              $setOnInsert: {
                _id: Random.id(),
                createdAt: new Date()
              },
              $set: set,
              $addToSet: {
                facebookAccounts: facebookAccountId
              }
            },
            { multi: true }
          );
      }
      peopleBulk.execute();
    }
  },
  getEntryLikes({ campaignId, facebookAccountId, entryId, accessToken }) {
    check(campaignId, String);
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("LikesHelpers.getEntryLikes called", {
      entryId
    });

    let response;
    try {
      response = Promise.await(
        FB.api(`${entryId}/reactions`, {
          limit: 1000,
          access_token: accessToken
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
          this.updatePeopleLikesCount({
            campaignId,
            facebookAccountId,
            likedPeople
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

exports.LikesHelpers = LikesHelpers;
