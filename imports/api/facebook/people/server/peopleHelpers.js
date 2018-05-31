import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Random } from "meteor/random";
import { uniqBy, groupBy, mapKeys, flatten, get, set } from "lodash";
import crypto from "crypto";

const PeopleHelpers = {
  getFormId({ personId, generate }) {
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }
    if (generate || !person.formId) {
      return this.generateFormId({ person });
    } else {
      return person.formId;
    }
  },
  generateFormId({ person }) {
    const formId = crypto
      .createHash("sha1")
      .update(person._id + new Date().getTime())
      .digest("hex")
      .substr(0, 7);
    People.update(person._id, { $set: { formId } });
    return formId;
  },
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
  findDuplicates({ personId }) {
    const person = People.findOne(personId);
    let matches = [];
    const _queries = () => {
      let queries = [];
      let defaultQuery = {
        _id: { $ne: person._id },
        campaignId: person.campaignId,
        $or: []
      };
      // avoid matching person with different facebookId
      if (person.facebookId) {
        defaultQuery.$and = [
          {
            $or: [
              { facebookId: { $exists: false } },
              { facebookId: person.facebookId }
            ]
          }
        ];
      }
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
        let query = { ...defaultQuery };
        query.$or = [];
        for (const field of fieldGroup) {
          const fieldVal = get(person, field);
          // clear previous value
          if (fieldVal) {
            query.$or.push({ [field]: fieldVal });
          }
        }
        if (query.$or.length) {
          queries.push(query);
        }
      }
      if (!queries.length) {
        return false;
      }
      return queries;
    };
    const queries = _queries();
    if (queries && queries.length) {
      for (const query of queries) {
        matches.push(People.find(query).fetch());
      }
    }

    let grouped = groupBy(uniqBy(flatten(matches), "_id"), "facebookId");

    return mapKeys(grouped, (value, key) => {
      if (person.facebookId && key == person.facebookId) {
        return "same";
      } else if (key == "undefined") {
        return "none";
      }
      return key;
    });
  },
  importPerson({ campaignId, person }) {
    let selector = { _id: Random.id(), campaignId };
    let foundMatch = false;
    const _queries = () => {
      let queries = [];
      let defaultQuery = { campaignId, $or: [] };
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
        let query = { ...defaultQuery };
        query.$or = [];
        for (const field of fieldGroup) {
          const fieldVal = person.$set[field];
          // clear previous value
          if (fieldVal) {
            query.$or.push({ [field]: fieldVal });
          }
        }
        if (query.$or.length) {
          queries.push(query);
        }
      }
      if (!queries.length) {
        return false;
      }
      return queries;
    };

    const _upsertAddToSet = () => {
      const keys = Object.keys(person.$addToSet);
      if (keys.length) {
        for (const key of keys) {
          for (const value of person.$addToSet[key].$each) {
            switch (key) {
              // Extra values
              case "campaignMeta.extra.extra":
                People.update(
                  {
                    ...selector,
                    [`${key}.key`]: value.key
                  },
                  {
                    $set: {
                      ...person.$set,
                      [`${key}.$.val`]: value.val
                    },
                    $setOnInsert: {
                      source: "import"
                    }
                  },
                  { multi: false }
                );
                break;
              default:
            }
          }
        }
      }
    };

    const queries = _queries();
    let matches = [];
    if (queries) {
      for (const query of queries) {
        matches.push(People.find(query).fetch());
      }
    }
    for (const match of matches) {
      if (match && match.length == 1) {
        foundMatch = true;
        selector._id = match[0]._id;
      }
    }

    if (foundMatch) {
      _upsertAddToSet();
    }

    res = People.upsert(
      selector,
      {
        ...person,
        $setOnInsert: {
          source: "import"
        }
      },
      { multi: false }
    );

    console.log(res);
    return res;
  }
};

exports.PeopleHelpers = PeopleHelpers;
