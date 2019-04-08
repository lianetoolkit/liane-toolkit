import { Promise } from "meteor/promise";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { People } from "/imports/api/facebook/people/people.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
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
      const peopleBulk = People.rawCollection().initializeOrderedBulkOp();
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

        // let lastInteraction = {
        //   facebookId: facebookAccountId
        // };
        // if (likedPerson.like.created_time) {
        //   lastInteraction["date"] = { $max: likedPerson.like.created_time };
        //   lastInteraction["estimate"] = true;
        // }
        set["name"] = likedPerson.name;
        set["counts.likes"] = likesCount;
        set["counts.reactions"] = reactionsCount;
        set["facebookAccountId"] = facebookAccountId;
        // set["lastInteraction"] = lastInteraction;

        for (const campaign of accountCampaigns) {
          // Person has the last interaction populated
          // peopleBulk
          //   .find({
          //     campaignId: campaign._id,
          //     facebookId: likedPerson.id,
          //     // "lastInteractions.facebookId": facebookAccountId
          //   })
          //   .update({
          //     $setOnInsert: {
          //       _id: Random.id(),
          //       createdAt: new Date()
          //     },
          //     $set: {
          //       ...set,
          //       // "lastInteractions.$": lastInteraction
          //     },
          //     $max: {
          //       "lastInteractionDate": likedPerson.like.created_time || 0
          //     },
          //     $addToSet: {
          //       facebookAccounts: facebookAccountId
          //     }
          //   });

          // Person does not have the last interaction populated
          peopleBulk
            .find({
              campaignId: campaign._id,
              facebookId: likedPerson.id
            })
            .upsert()
            .update({
              $setOnInsert: {
                _id: Random.id(),
                createdAt: new Date()
              },
              $set: set,
              $max: {
                lastInteractionDate: new Date(
                  likedPerson.like.created_time || 0
                )
              },
              $addToSet: {
                facebookAccounts: facebookAccountId
                // lastInteractions: lastInteraction
              }
            });
        }
      }
      peopleBulk.execute();

      // for (const campaign of accountCampaigns) {
      //   for (const likedPerson of likedPeople) {
      //     JobsHelpers.addJob({
      //       jobType: "people.sumPersonInteractions",
      //       jobData: {
      //         campaignId: campaign._id,
      //         facebookId: likedPerson.id
      //       }
      //     });
      //   }
      // }
    }
  },
  getEntryLikes({
    campaignId,
    facebookAccountId,
    entryId,
    likeDateEstimate,
    accessToken
  }) {
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
      let likedPeople = [];
      for (const like of data) {
        like.facebookAccountId = facebookAccountId;
        const personId = like.id;
        delete like.id;
        let insert = {
          _id: Random.id(),
          personId,
          entryId
        };
        if (likeDateEstimate) {
          insert["created_time"] = new Date();
        }
        likedPeople.push({ id: personId, name: like.name, like: insert });
        bulk
          .find({ personId, entryId })
          .upsert()
          .update({
            $setOnInsert: insert,
            $set: like
          });
      }
      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          // If like date estimate is set, update people from upserted result so it doesnt update last interaction date for all people.
          if (likeDateEstimate) {
            const upsertedLikes = result.getRawResponse().upserted;
            if (upsertedLikes.length) {
              const likes = Likes.find({
                _id: { $in: upsertedLikes.map(l => l._id) }
              }).fetch();
              likedPeople = likedPeople.filter(person =>
                likes.find(l => l.personId == person.id)
              );
            }
          }
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
