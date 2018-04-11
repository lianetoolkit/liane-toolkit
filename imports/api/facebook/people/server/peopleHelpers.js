import { People } from "/imports/api/facebook/people/people.js";
import { Random } from "meteor/random";

const PeopleHelpers = {
  updateFBUsers({ campaignId, facebookAccountId }) {
    const collection = People.rawCollection();
    const aggregate = Meteor.wrapAsync(collection.aggregate, collection);

    const data = aggregate([
      {
        $match: {
          facebookAccounts: { $in: [facebookAccountId] }
        }
      },
      {
        $group: {
          _id: "$facebookId",
          name: { $first: "$name" },
          counts: { $first: `$counts.${facebookAccountId}` }
        }
      },
      {
        $project: {
          _id: null,
          facebookId: "$_id",
          name: "$name",
          [`counts.${facebookAccountId}`]: "$counts"
        }
      }
    ]);

    if (data.length) {
      const peopleBulk = collection.initializeUnorderedBulkOp();
      for (const person of data) {
        peopleBulk
          .find({
            campaignId,
            facebookId: person.facebookId
          })
          .upsert()
          .update({
            $setOnInsert: {
              _id: Random.id(),
              createdAt: new Date()
            },
            $set: {
              name: person.name,
              [`counts.${facebookAccountId}`]: person.counts[facebookAccountId]
            },
            $addToSet: {
              facebookAccounts: facebookAccountId
            }
          });
      }
      peopleBulk.execute();
    }
  }
};

exports.PeopleHelpers = PeopleHelpers;
