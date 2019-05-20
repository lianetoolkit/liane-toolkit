import { Promise } from "meteor/promise";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { People } from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "/imports/api/facebook/people/server/peopleHelpers.js";
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
  handleWebhook({ facebookAccountId, data }) {
    switch (data.verb) {
      case "add":
      case "edit":
        this.upsertReaction({ facebookAccountId, data });
        break;
      case "remove":
        this.removeReaction({ facebookAccountId, data });
        this.break;
      default:
    }
  },
  upsertReaction({ facebookAccountId, data }) {
    console.log(data.verb, { data });
    let reaction = {
      facebookAccountId,
      entryId: data.post_id,
      personId: data.from.id,
      name: data.from.name,
      type: data.reaction_type.toUpperCase(),
      created_time: data.created_time * 1000
    };
    let query = { personId: reaction.personId, entryId: reaction.entryId };
    // Handle entry comment reaction
    if (data.comment_id) {
      reaction.parentId = data.comment_id;
      query.parentId = data.comment_id;
    }
    Likes.upsert(query, { $set: reaction });

    // Upsert person
    if (reaction.personId) {
      const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
        facebookId: facebookAccountId
      });
      let set = {
        updatedAt: new Date()
      };
      set["counts"] = PeopleHelpers.getInteractionCount({
        facebookId: reaction.personId,
        facebookAccountId
      });
      set["facebookAccountId"] = facebookAccountId;

      let addToSet = {
        facebookAccounts: facebookAccountId
      };

      // Build update obj
      let updateObj = {
        $setOnInsert: {
          createdAt: new Date(),
          source: "facebook",
          name: data.from.name
        },
        $set: set
      };

      if (reaction.created_time) {
        updateObj.$max = {
          lastInteractionDate: new Date(reaction.created_time)
        };
      }
      if (Object.keys(addToSet).length) {
        updateObj.$addToSet = addToSet;
      }

      const PeopleRawCollection = People.rawCollection();
      for (const campaign of accountCampaigns) {
        PeopleRawCollection.update(
          {
            campaignId: campaign._id,
            facebookId: reaction.personId
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
  },
  removeReaction({ facebookAccountId, data }) {
    let query = {
      personId: data.from.id,
      entryId: data.post_id
    };
    if (data.comment_id) {
      query.parentId = data.comment_id;
    }
    Likes.remove(query);

    // Upsert person
    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId
    });
    for (const campaign of accountCampaigns) {
      People.update(
        {
          campaignId: campaign._id,
          facebookId: data.from.id
        },
        {
          $set: {
            counts: PeopleHelpers.getInteractionCount({
              facebookId: data.from.id,
              facebookAccountId
            })
          }
        }
      );
    }
  },
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

        set["name"] = likedPerson.name;
        set["counts.likes"] = likesCount;
        set["counts.reactions"] = reactionsCount;
        set["facebookAccountId"] = facebookAccountId;

        let updateObj = {
          $setOnInsert: {
            _id: Random.id(),
            createdAt: new Date(),
            source: "facebook"
          },
          $set: set,
          $addToSet: {
            facebookAccounts: facebookAccountId
          }
        };

        if (likedPerson.like.created_time) {
          updateObj.$max = {
            lastInteractionDate: new Date(likedPerson.like.created_time || 0)
          };
        }

        for (const campaign of accountCampaigns) {
          peopleBulk
            .find({
              campaignId: campaign._id,
              facebookId: likedPerson.id
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
