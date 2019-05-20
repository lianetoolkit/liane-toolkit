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
    } else {
      query.parentId = { $exists: false };
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
  handleCommentsReactions({
    facebookAccountId,
    entryId,
    commentId,
    accessToken
  }) {
    this.getObjectReactions({
      facebookAccountId,
      entryId,
      objectId: commentId,
      likeDateEstimate: false,
      accessToken
    });
  },
  getReactionTypes() {
    return ["NONE", "LIKE", "LOVE", "WOW", "HAHA", "SAD", "ANGRY", "THANKFUL"];
  },
  updatePeopleLikesCountByEntry({ facebookAccountId, entryId }) {
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
        facebookAccountId,
        likedPeople
      });
    }
  },
  updatePeopleLikesCount({ facebookAccountId, likedPeople }) {
    check(facebookAccountId, String);

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId
    });

    if (likedPeople.length) {
      const peopleBulk = People.rawCollection().initializeOrderedBulkOp();
      for (const likedPerson of likedPeople) {
        let set = {
          updatedAt: new Date()
        };

        set["name"] = likedPerson.name;
        set["facebookAccountId"] = facebookAccountId;
        set["counts"] = PeopleHelpers.getInteractionCount({
          facebookAccountId,
          facebookId: likedPerson.id
        });

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
            lastInteractionDate: new Date(likedPerson.like.created_time)
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
    }
  },
  getObjectReactions({
    facebookAccountId,
    entryId,
    objectId,
    likeDateEstimate,
    accessToken
  }) {
    check(facebookAccountId, String);
    check(entryId, String);
    check(accessToken, String);

    logger.debug("LikesHelpers.getObjectReactions called", {
      objectId
    });

    let response;
    try {
      response = Promise.await(
        FB.api(`${objectId || entryId}/reactions`, {
          limit: 1000,
          access_token: accessToken
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

    logger.debug("LikesHelpers.getObjectReactions response", { response });

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
        let bulkQuery = { personId, entryId };
        if (objectId) {
          insert.parentId = objectId;
          bulkQuery.parentId = objectId;
        } else {
          bulkQuery.parentId = { $exists: false };
        }
        if (likeDateEstimate) {
          insert["created_time"] = new Date();
        }
        likedPeople.push({ id: personId, name: like.name, like: insert });
        bulk
          .find(bulkQuery)
          .upsert()
          .update({
            $setOnInsert: insert,
            $set: like
          });
      }
      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          this.updatePeopleLikesCount({
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
