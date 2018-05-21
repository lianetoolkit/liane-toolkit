import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
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
  },
  import({ campaignId, config, data }) {
    let importData = [];
    for (const item of data) {
      let obj = { $set: { campaignId }, $addToSet: {} };
      let customFields = [];
      for (const key in item) {
        const itemConfig = config[key];
        if (itemConfig && itemConfig.value) {
          let modelKey = itemConfig.value;
          if (modelKey !== "skip") {
            if (modelKey == "custom") {
              customFields.push({
                key: itemConfig.customField,
                val: item[key]
              });
            } else {
              obj.$set[modelKey] = item[key];
            }
          }
        }
      }
      if (customFields.length) {
        obj.$addToSet["campaignMeta.extra.extra"] = { $each: customFields };
      }
      importData.push(obj);
    }
    // add job per person
    for (const person of importData) {
      JobsHelpers.addJob({
        jobType: "people.importPerson",
        jobData: {
          campaignId,
          person: JSON.stringify(person)
        }
      });
    }

    return;
  },
  importPerson({ campaignId, person }) {
    const _find = person => {
      let find = { campaignId, $or: [] };
      // sorted by uniqueness importance
      const fieldGroups = [
        ["name"],
        [
          "campaignMeta.contact.email",
          "campaignMeta.social_networks.twitter",
          "campaignMeta.social_networks.instagram"
        ]
      ];
      for (const fieldGroup of fieldGroups) {
        if (find.$or.length) find.$or = [];
        for (const field of fieldGroup) {
          const fieldVal = person.$set[field];
          // clear previous value
          if (fieldVal) {
            find.$or.push({ [field]: fieldVal });
          }
        }
      }
      if (!find.$or.length) {
        return false;
      }
      return find;
    };

    let matchQuery = _find(person);
    let match = [];
    let selector = { _id: Random.id() };
    if (matchQuery) match = People.find(matchQuery).fetch();
    if (match && match.length == 1) {
      selector._id = match[0]._id;
    }
    return People.upsert(selector, person, { multi: false });
  }
};

exports.PeopleHelpers = PeopleHelpers;
