import { Promise } from "meteor/promise";
import axios from "axios";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import {
  People,
  PeopleTags,
  PeopleLists,
  PeopleExports,
} from "/imports/api/facebook/people/people.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import { LikesHelpers } from "/imports/api/facebook/likes/server/likesHelpers.js";
import { Random } from "meteor/random";
import { uniqBy, groupBy, mapKeys, flatten, get, set, cloneDeep, pick } from "lodash";
import Papa from "papaparse";
import crypto from "crypto";
import fs from "fs";
import mkdirp from "mkdirp";
import { flattenObject } from "/imports/utils/common.js";

const googleMapsKey = Meteor.settings.googleMaps;

const PeopleHelpers = {
  getFormId({ personId, generate }) {
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }
    if (generate || !person.formId) {
      return this.updateFormId({ person });
    } else {
      return person.formId;
    }
  },
  updateFormId({ person }) {
    const formId = this.generateFormId(person._id);
    People.update(person._id, { $set: { formId } });
    return formId;
  },
  generateFormId(id) {
    return crypto
      .createHash("sha1")
      .update(id + new Date().getTime())
      .digest("hex")
      .substr(0, 7);
  },
  getInteractionCount({ facebookId, facebookAccountId }) {
    const commentsCount = Comments.find({
      personId: facebookId,
      facebookAccountId,
    }).count();
    const likesCount = Likes.find({
      personId: facebookId,
      facebookAccountId: facebookAccountId,
      parentId: { $exists: false },
    }).count();
    let reactionsCount = {};
    const reactionTypes = LikesHelpers.getReactionTypes();
    for (const reactionType of reactionTypes) {
      reactionsCount[reactionType.toLowerCase()] = Likes.find({
        personId: facebookId,
        facebookAccountId: facebookAccountId,
        type: reactionType,
        parentId: { $exists: false },
      }).count();
    }
    return {
      comments: commentsCount,
      likes: likesCount,
      reactions: reactionsCount,
    };
  },
  updateInteractionCountSum({ personId }) {
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }
    let counts = {
      comments: 0,
      likes: 0,
      reactions: {
        none: 0,
        like: 0,
        love: 0,
        wow: 0,
        haha: 0,
        sad: 0,
        angry: 0,
        thankful: 0,
      },
    };
    if (person.counts) {
      for (let facebookId in person.counts) {
        if (facebookId !== "all") {
          const personCounts = person.counts[facebookId];
          if (!isNaN(personCounts.comments)) {
            counts.comments += personCounts.comments;
          }
          if (!isNaN(personCounts.likes)) {
            counts.likes += personCounts.likes;
          }
          for (let reaction in personCounts.reactions) {
            counts.reactions[reaction] += personCounts.reactions[reaction];
            if (!isNaN(personCounts.reactions[reaction])) {
            }
          }
        }
      }
    }
    return People.update(personId, { $set: { "counts.all": counts } });
  },
  geocodePerson({ personId }) {
    if (!personId) return;
    const person = People.findOne(personId);
    let location;
    try {
      location = Promise.await(
        this.geocode({
          address: get(person, "campaignMeta.basic_info.address"),
        })
      );
    } catch (err) { }
    People.update(personId, { $set: { location } });
  },
  geocode({ address }) {
    let str = "";
    if (address.country) {
      str = address.country + " " + str;
    }
    if (address.zipcode) {
      str = address.zipcode + " " + str;
    }
    if (address.region) {
      str = address.region + " " + str;
    }
    if (address.city) {
      str = address.city + " " + str;
    }
    if (address.neighbourhood) {
      str = address.neighbourhood + " " + str;
    }
    if (address.street) {
      if (address.number) {
        str = address.number + " " + str;
      }
      str = address.street + " " + str;
    }
    return new Promise((resolve, reject) => {
      if (str && Object.keys(address).length > 1 && googleMapsKey) {
        axios
          .get("https://maps.googleapis.com/maps/api/geocode/json", {
            params: {
              address: str,
              key: googleMapsKey,
            },
          })
          .then((res) => {
            if (res.data.results && res.data.results.length) {
              const data = res.data.results[0];
              resolve({
                formattedAddress: data.formatted_address,
                coordinates: [
                  data.geometry.location.lat,
                  data.geometry.location.lng,
                ],
              });
            } else {
              reject();
            }
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        reject();
      }
    });
  },
  updateFBUsers({ campaignId, facebookAccountId }) {
    const collection = People.rawCollection();
    const data = Promise.await(
      collection
        .aggregate([
          {
            $match: {
              facebookAccountId: facebookAccountId,
            },
          },
          {
            $group: {
              _id: "$facebookId",
              name: { $first: "$name" },
              counts: { $first: `$counts` },
              lastInteractionDate: { $first: `$lastInteractionDate` },
            },
          },
          {
            $project: {
              _id: null,
              facebookId: "$_id",
              name: "$name",
              counts: "$counts",
              lastInteractionDate: "$lastInteractionDate",
            },
          },
        ])
        .toArray()
    );

    if (data.length) {
      const peopleBulk = collection.initializeUnorderedBulkOp();
      for (const person of data) {
        const _id = Random.id();
        peopleBulk
          .find({
            campaignId,
            facebookId: person.facebookId,
          })
          .upsert()
          .update({
            $setOnInsert: {
              _id,
              formId: this.generateFormId(_id),
              createdAt: new Date(),
            },
            $set: {
              name: person.name,
              facebookAccountId,
              [`counts`]: person.counts,
              lastInteractionDate: person.lastInteractionDate,
            },
            $addToSet: {
              facebookAccounts: facebookAccountId,
            },
          });
      }
      peopleBulk.execute();
    }
  },
  export({ campaignId, query }) {
    let header = {};

    const fileKey = crypto
      .createHash("sha1")
      .update(campaignId + JSON.stringify(query) + new Date().getTime())
      .digest("hex")
      .substr(0, 7);

    const batchInterval = 10000;

    const tags = PeopleTags.find({ campaignId }).fetch();

    const totalCount = Promise.await(
      People.rawCollection()
        .find(query.query, {
          ...query.options,
          ...{
            limit: 0,
            fields: {
              name: 1,
              facebookId: 1,
              campaignMeta: 1,
              counts: 1,
            },
          },
        })
        .count()
    );

    const batchAmount = Math.ceil(totalCount / batchInterval);

    const processPerson = (person) => {
      if (person.campaignMeta) {
        for (let key in person.campaignMeta) {
          person[key] = person.campaignMeta[key];
        }
        delete person.campaignMeta;
        // Parse tags
        if (person.basic_info && person.basic_info.tags) {
          person.tags = person.basic_info.tags
            .map((tagId) => {
              const tagObj = tags.find((t) => t._id == tagId);
              return tagObj ? tagObj.name : null;
            })
            .join(",");
          delete person.basic_info.tags;
        }
        if (!Object.keys(person.basic_info).length) {
          delete person.basic_info;
        }
      }
      return person;
    };

    // first batch run get all headers
    for (let i = 0; i < batchAmount; i++) {
      const limit = batchInterval;
      const skip = batchInterval * i;
      Promise.await(
        new Promise((resolve, reject) => {
          People.rawCollection()
            .find(query.query, {
              ...query.options,
              ...{
                limit: limit,
                skip: skip,
                fields: {
                  name: 1,
                  facebookId: 1,
                  campaignMeta: 1,
                  counts: 1,
                },
              },
            })
            .forEach(
              (person) => {
                const flattenedPerson = flattenObject(processPerson(person));
                for (let key in flattenedPerson) {
                  header[key] = true;
                }
              },
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  resolve();
                }
              }
            );
        })
      );
    }

    const fileDir = `${process.env.PWD}/generated-files/${campaignId}`;
    const fileName = `people-export-${fileKey}.csv`;
    const filePath = `${fileDir}/${fileName}`;

    header = Object.keys(header);

    Promise.await(
      new Promise((resolve, reject) => {
        mkdirp(fileDir)
          .then(() => {
            fs.writeFile(filePath, header.join(",") + "\r\n", (err) => {
              if (err) reject(err);
              else resolve();
            });
          })
          .catch((err) => {
            throw new Meteor.Error(err);
          });
      })
    );

    let writeStream = fs.createWriteStream(filePath, { flags: "a" });

    // second batch run store values
    for (let i = 0; i < batchAmount; i++) {
      const limit = batchInterval;
      const skip = batchInterval * i;
      let flattened = [];
      Promise.await(
        new Promise((resolve, reject) => {
          People.rawCollection()
            .find(query.query, {
              ...query.options,
              ...{
                limit,
                skip,
                fields: {
                  name: 1,
                  facebookId: 1,
                  campaignMeta: 1,
                  counts: 1,
                },
              },
            })
            .forEach(
              (person) => {
                flattened.push(flattenObject(processPerson(person)));
              },
              (err) => {
                if (err) {
                  reject(err);
                } else {
                  writeStream.write(
                    Papa.unparse(
                      {
                        fields: header,
                        data: flattened,
                      },
                      {
                        header: false,
                      }
                    ) + "\r\n"
                  );
                  resolve();
                }
              }
            );
        })
      );
    }

    writeStream.end();

    const url = Promise.await(
      new Promise((resolve, reject) => {
        writeStream.on("finish", () => {
          resolve(
            `${Meteor.settings.filesUrl || ""}/${campaignId}/${fileName}`
          );
        });
      })
    );

    // Expires 12 hours from now
    const expirationDate = new Date(Date.now() + 12 * 60 * 60 * 1000);

    const exportId = PeopleExports.insert({
      campaignId,
      url,
      path: filePath,
      count: totalCount,
      expiresAt: expirationDate,
    });

    // Create job to delete export file
    JobsHelpers.addJob({
      jobType: "people.expireExport",
      jobData: {
        campaignId,
        exportId,
        expirationDate,
      },
    });

    return exportId;
  },
  import({ campaignId, config, filename, data, defaultValues }) {
    let importData = [];

    const listId = PeopleLists.insert({ name: filename, campaignId });

    // Build default person
    let defaultPerson = {
      $set: {
        campaignId,
      },
      $addToSet: {},
    };

    if (defaultValues) {
      if (defaultValues.tags && defaultValues.tags.length) {
        defaultPerson.$set["campaignMeta.basic_info.tags"] = defaultValues.tags;
      }
      if (defaultValues.labels) {
        for (let key in defaultValues.labels) {
          if (defaultValues.labels[key]) {
            defaultPerson.$set[`campaignMeta.${key}`] = true;
          }
        }
      }
      if (defaultValues.country) {
        defaultPerson.$set["campaignMeta.basic_info.address.country"] =
          defaultValues.country;
      }
      if (defaultValues.region) {
        defaultPerson.$set["campaignMeta.basic_info.address.region"] =
          defaultValues.region;
      }
      if (defaultValues.city) {
        defaultPerson.$set["campaignMeta.basic_info.address.city"] =
          defaultValues.city;
      }
    }

    // Add data
    data.forEach(function (item) {
      let obj = cloneDeep(defaultPerson);
      let customFields = [];
      for (let key in item) {
        const itemConfig = config[key];
        if (itemConfig && itemConfig.value) {
          let modelKey = itemConfig.value;
          if (modelKey !== "skip") {
            if (modelKey == "custom") {
              customFields.push({
                key: itemConfig.customField,
                val: item[key],
              });
            } else {
              obj.$set[modelKey] = item[key];
            }
          }
        }
      }
      if (customFields.length) {
        obj.$addToSet["campaignMeta.extra"] = { $each: customFields };
      }
      importData.push(obj);
    });
    // add job per person
    const job = JobsHelpers.addJob({
      jobType: "people.import",
      jobData: { campaignId, count: importData.length, listId },
    });
    setTimeout(
      Meteor.bindEnvironment(() => {
        for (let person of importData) {
          JobsHelpers.addJob({
            jobType: "people.importPerson",
            jobData: {
              campaignId,
              jobId: job,
              listId,
              person: JSON.stringify(person),
            },
          });
        }
      }),
      10
    );

    return;
  },
  markUnresolve({ personId, related = [] }) {
    let $set = { unresolved: true }
    let $addToSet = {}
    if (related.length > 0) {
      $set.related = related;
    }
    People.update(personId, { $set, $addToSet });
  },
  registerDuplicates({ personId, source }) {

    let parentID = personId;
    let IDs = [];
    //  Call to find duplicctes
    res = this.findDuplicates({ personId, source });
    /* Get list of all the duplicates found  */
    Object.keys(res).map(key => {
      res[key].map(person => {
        this.markUnresolve({
          personId: person._id
        })
        IDs.push(person._id)
        if (person.facebookAccountId) parentID = person._id
      })
    })
    // In case we dont find anyone with a facebookAcccountId we set the new one asa the parent.
    if (personId != parentID) {
      IDs = IDs.filter(e => e != parentID)
      IDs.push(personId)
      this.markUnresolve({
        personId
      })
    }
    this.markUnresolve({
      personId: parentID,
      related: IDs
    })
  },
  // perdonId from just created, source [ comments|likes ]
  findDuplicates({ personId, source }) {

    const person = People.findOne(personId);
    let matches = [];
    let _queries = null;

    _queries = () => {
      let queries = [];
      let fieldGroups;
      let defaultQuery = {
        _id: { $ne: person._id },
        campaignId: person.campaignId,
        $or: [],
      };


      if (source) {
        fieldGroups = [
          ["name"]
        ];
      } else {

        // avoid matching person with different facebookId

        if (person.facebookId) {
          defaultQuery.$and = [
            {
              $or: [
                { facebookId: { $exists: false } },
                { facebookId: person.facebookId },
              ],
            },
          ];
        }

        fieldGroups = [
          ["name"],
          [
            "campaignMeta.contact.email",
            "campaignMeta.contact.cellphone",
            "campaignMeta.social_networks.twitter",
            "campaignMeta.social_networks.instagram",
          ],
        ];

      }
      // sorted by uniqueness importance

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
    // console.log(JSON.stringify(queries, null, 5));
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
  importPerson({ campaignId, listId, person }) {
    // Generating new ID
    const _id = Random.id();

    // Using upsert because `person` object contain modifiers ($set)
    // This will always be inserted (new person)
    People.upsert(
      { _id, campaignId },
      {
        ...person,
        $setOnInsert: {
          listId,
          source: "import",
          formId: this.generateFormId(_id),
        },
      }
    );

    this.geocodePerson({ personId: _id });

    // Clear empty campaign lists
    // const campaignLists = PeopleLists.find({ campaignId }).fetch();
    // for (let list of campaignLists) {
    //   if (!People.find({ listId: list._id }).count()) {
    //     PeopleLists.remove(list._id);
    //   }
    // }

    return _id;
  },
  expireExport({ exportId }) {
    const item = PeopleExports.findOne(exportId);
    if (!item) return;
    // Remove file
    Promise.await(
      new Promise((resolve, reject) => {
        fs.unlink(item.path, resolve);
      })
    );
    // Update doc
    return PeopleExports.update(exportId, { $set: { expired: true } });
  },
};

exports.PeopleHelpers = PeopleHelpers;
