import { Promise } from "meteor/promise";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { People } from "/imports/api/facebook/people/people.js";
import { PeopleHelpers } from "/imports/api/facebook/people/server/peopleHelpers.js";
import { EntriesHelpers } from "/imports/api/facebook/entries/server/entriesHelpers.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { FacebookAccountsHelpers } from "/imports/api/facebook/accounts/server/accountsHelpers.js";
import { AccountsLogs } from "/imports/api/accountsLogs/accountsLogs";
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
  handleWebhook({ facebookAccountId, data, time }) {
    switch (data.verb) {
      case "add":
      case "edit":
        this.upsertReaction({ facebookAccountId, data, time });
        break;
      case "remove":
        this.removeReaction({ facebookAccountId, data, time });
        break;
      default:
    }
  },
  upsertReaction({ facebookAccountId, data, time }) {
    if (!data.from) return;
    let reaction = {
      facebookAccountId,
      entryId: data.post_id,
      personId: data.from.id,
      name: data.from.name,
      type: data.reaction_type.toUpperCase(),
    };
    if (data.created_time || time) {
      reaction.created_time = (data.created_time || time) * 1000;
    } else {
      reaction.created_time = Date.now();
    }
    let query = { personId: reaction.personId, entryId: reaction.entryId };
    // Handle entry comment reaction
    if (data.comment_id) {
      reaction.parentId = data.comment_id;
      query.parentId = data.comment_id;
      CommentsHelpers.upsertComment({
        facebookAccountId,
        data: {
          comment_id: data.comment_id,
          post_id: data.post_id,
        },
      });
    } else {
      query.parentId = { $exists: false };
    }

    const LikesRawCollection = Likes.rawCollection();
    LikesRawCollection.update(
      query,
      { $set: reaction, $setOnInsert: { _id: Random.id() } },
      { upsert: true, multi: false }
    );

    AccountsLogs.upsert(
      {
        accountId: facebookAccountId,
        type: `reactions.${data.verb}`,
        parentId: reaction.entryId,
        personId: reaction.personId,
        objectType: data.reaction_type,
        data: {
          isCommentReaction: data.comment_id || false,
        },
      },
      {
        $setOnInsert: {
          isAdmin: reaction.personId == facebookAccountId,
        },
        $set: {
          timestamp: reaction.created_time,
        },
      }
    );

    // Update entry interaction count
    try {
      EntriesHelpers.updateInteractionCount({
        entryId: data.post_id,
        facebookAccountId,
      });
    } catch (e) {
      logger.debug("Entry update failed", e);
    }

    // Upsert person
    if (reaction.personId) {
      const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
        facebookId: facebookAccountId,
      });
      let set = {
        updatedAt: new Date(),
      };

      const counts = PeopleHelpers.getInteractionCount({
        sourceId: reaction.personId,
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

      // Build update obj
      let updateObj = {
        $setOnInsert: {
          createdAt: new Date(),
          source: "facebook",
          name: data.from.name,
        },
        $set: set,
      };

      if (reaction.created_time) {
        updateObj.$max = {
          lastInteractionDate: new Date(reaction.created_time),
        };
      }
      if (Object.keys(addToSet).length) {
        updateObj.$addToSet = addToSet;
      }

      const PeopleRawCollection = People.rawCollection();

      for (const campaign of accountCampaigns) {
        const person = People.findOne({
          campaignId: campaign._id,
          facebookId: reaction.personId,
        });

        let _id = null;

        if (person) {
          _id = person._id;
          PeopleRawCollection.update({ _id }, updateObj);
        } else {
          _id = Random.id();
          Promise.await(
            PeopleRawCollection.update(
              {
                campaignId: campaign._id,
                facebookId: reaction.personId,
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
          //! Check Duplicates
          PeopleHelpers.registerDuplicates({ personId: _id, source: "likes" });

          AccountsLogs.insert({
            type: "people.new",
            accountId: facebookAccountId,
            personId: reaction.personId,
            timestamp: reaction.created_time,
          });
        }
      }
    }
  },
  removeReaction({ facebookAccountId, data, time }) {
    if (!data.from) return;
    let query = {
      personId: data.from.id,
      entryId: data.post_id,
    };
    if (data.comment_id) {
      query.parentId = data.comment_id;
    } else {
      query.parentId = { $exists: false };
    }
    Likes.remove(query);

    let timestamp;
    if (data.created_time || time) {
      timestamp = (data.created_time || time) * 1000;
    } else {
      timestamp = Date.now();
    }

    AccountsLogs.upsert(
      {
        type: "reactions.remove",
        accountId: facebookAccountId,
        personId: query.personId,
        objectType: data.reaction_type,
        parentId: query.entryId,
        data: {
          isCommentReaction: data.comment_id || false,
        },
      },
      {
        $set: {
          timestamp: timestamp,
        },
      }
    );

    // Update entry
    try {
      EntriesHelpers.updateInteractionCount({ entryId: data.post_id });
    } catch (e) {
      logger.debug("Entry update failed", e);
    }

    // Update person
    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId,
    });
    for (const campaign of accountCampaigns) {
      const counts = PeopleHelpers.getInteractionCount({
        sourceId: data.from.id,
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
          facebookId: data.from.id,
        },
        {
          $set: set,
        }
      );
    }
  },
  handleCommentsReactions({
    facebookAccountId,
    entryId,
    commentId,
    accessToken,
  }) {
    this.getObjectReactions({
      facebookAccountId,
      entryId,
      objectId: commentId,
      likeDateEstimate: false,
      accessToken,
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
      entryId,
    }).map((like) => {
      return {
        id: like.personId,
        name: like.name,
      };
    });

    if (likedPeople.length) {
      this.updatePeopleLikesCount({
        facebookAccountId,
        likedPeople,
      });
    }
  },
  updatePeopleLikesCount({ facebookAccountId, likedPeople }) {
    check(facebookAccountId, String);

    const accountCampaigns = FacebookAccountsHelpers.getAccountCampaigns({
      facebookId: facebookAccountId,
    });

    const people = {};
    for (const person of likedPeople) {
      if (!people[person.id]) {
        people[person.id] = {
          name: person.name,
          latestReaction: 0,
        };
      }
      people[person.id].latestReaction = Math.max(
        person.like.created_time || 0,
        people[person.id].latestReaction
      );
    }

    if (likedPeople.length) {
      const peopleBulk = People.rawCollection().initializeUnorderedBulkOp();
      for (const personId in people) {
        const likedPerson = people[personId];
        let set = {
          updatedAt: new Date(),
        };

        set["name"] = likedPerson.name;
        set["facebookAccountId"] = facebookAccountId;
        const counts = PeopleHelpers.getInteractionCount({
          facebookAccountId,
          sourceId: personId,
          source: "facebook",
        });
        set["counts.facebook"] = counts.facebook;
        set["counts.instagram"] = counts.instagram;
        set["counts.comments"] = counts.comments;

        let updateObj = {
          $setOnInsert: {
            createdAt: new Date(),
            source: "facebook",
          },
          $set: set,
          $addToSet: {
            facebookAccounts: facebookAccountId,
          },
        };

        if (likedPerson.latestReaction) {
          updateObj.$max = {
            lastInteractionDate: new Date(likedPerson.latestReaction),
          };
        }

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
                _id: _id,
                formId: PeopleHelpers.generateFormId(_id),
              },
            });
        }
      }
      peopleBulk.execute();
    }
  },
  getInstagramObjectReactions({
    facebookAccountId,
    entryId,
    objectId,
    likeDateEstimate,
    accessToken,
  }) {
    logger.debug("LikesHelpers.getInstagramObjectReactions called", {
      facebookAccountId,
      entryId,
      objectId,
      likeDateEstimate,
      accessToken,
    });
    //PENDING
    return;
  },
  getObjectReactions({
    facebookAccountId,
    entryId,
    objectId,
    likeDateEstimate,
    accessToken,
  }) {
    check(facebookAccountId, String);
    check(accessToken, String);

    if (!entryId && !objectId) {
      throw new Meteor.Error(500, "Object ID or Entry ID must be defined");
    }

    logger.debug("LikesHelpers.getObjectReactions called", {
      entryId,
      objectId,
    });

    switch (EntriesHelpers.getEntrySource({ entryId })) {
      case "instagram":
        return this.getInstagramObjectReactions({
          facebookAccountId,
          entryId,
          objectId,
          likeDateEstimate,
          accessToken,
        });
      default:
        // Facebook
        // do nothing here, facebook is the default behaviour of this function
        break;
    }

    let response;
    try {
      response = Promise.await(
        FB.api(`${objectId || entryId}/reactions`, {
          limit: 1000,
          access_token: accessToken,
        })
      );
    } catch (error) {
      throw new Meteor.Error(error);
    }

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
          entryId,
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
        bulk.find(bulkQuery).upsert().update({
          $setOnInsert: insert,
          $set: like,
        });
      }
      bulk.execute(
        Meteor.bindEnvironment((e, result) => {
          this.updatePeopleLikesCount({
            facebookAccountId,
            likedPeople,
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
  },
};

exports.LikesHelpers = LikesHelpers;
