import { Promise } from "meteor/promise";
import axios from "axios";
import moment from "moment";
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
import { uniqBy, groupBy, mapKeys, flatten, get, cloneDeep } from "lodash";
import Papa from "papaparse";
import crypto from "crypto";
import fs from "fs";
import mkdirp from "mkdirp";
import { flattenObject } from "/imports/utils/common.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";

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
  getInteractionCount({ sourceId, facebookAccountId, source }) {
    // logger.debug("peopleHelpers: getInteractionCount() called", {
    //   sourceId,
    //   facebookAccountId,
    //   source,
    // });
    let person;
    if (source == "facebook") {
      person = People.findOne({ facebookId: sourceId, facebookAccountId });
    } else if (source == "instagram") {
      person = People.findOne({
        "campaignMeta.social_networks.instagram": `@${sourceId}`,
        facebookAccountId,
      });
    } else {
      person = People.findOne({ _id: sourceId, facebookAccountId });
    }
    let facebook = {};
    let instagram = {};
    const instagramHandle = get(
      person,
      "campaignMeta.social_networks.instagram"
    );
    if (source == "instagram" || instagramHandle) {
      const instagramId = (instagramHandle || sourceId).replace("@", "").trim();
      const instagramQuery = {
        facebookAccountId,
        source: "instagram",
      };
      if (person?.facebookId) {
        instagramQuery.$or = [
          { personId: instagramId },
          { personId: person.facebookId },
        ];
      } else {
        instagramQuery.personId = instagramId;
      }
      instagram.comments = Comments.find(instagramQuery).count();
    }
    if (source == "facebook" || person?.facebookId) {
      const facebookId = person?.facebookId || sourceId;
      facebook = {
        comments: Comments.find({
          personId: facebookId,
          facebookAccountId,
          $or: [{ source: "facebook" }, { source: { $exists: false } }],
        }).count(),
        likes: Likes.find({
          personId: facebookId,
          facebookAccountId: facebookAccountId,
          parentId: { $exists: false },
        }).count(),
        reactions: {},
      };
      const reactionTypes = LikesHelpers.getReactionTypes();
      for (const reactionType of reactionTypes) {
        facebook.reactions[reactionType.toLowerCase()] = Likes.find({
          personId: facebookId,
          facebookAccountId: facebookAccountId,
          type: reactionType,
          parentId: { $exists: false },
        }).count();
      }
    }
    const sumComments = () => {
      let count = 0;
      if (facebook.comments) count += facebook.comments;
      if (instagram.comments) count += instagram.comments;
      return Math.max(parseInt(count, 10), 0);
    };
    return {
      facebook,
      instagram,
      comments: sumComments(),
    };
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
    } catch (err) {}
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
        // Parse Birthday
        if (person.basic_info && person.basic_info.birthday) {
          person.basic_info.birthday = moment(
            person.basic_info.birthday
          ).format("YYYY-MM-DD");
        }

        if (person.basic_info && !Object.keys(person.basic_info).length) {
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
  lianeImport({ campaignId, data, filename }) {
    let importData = [];
    const listId = PeopleLists.insert({ name: filename, campaignId });
    // Build default person
    let defaultPerson = {
      $set: {
        campaignId,
      },
      $addToSet: {},
    };
    const peopleTags = PeopleTags.find({ campaignId }).fetch();
    const tags = {};
    peopleTags.map((tag) => {
      tags[tag.name] = tag._id;
    });
    // BUILD META
    //Job per person
    const rootAllowed = ["name"];
    data.forEach(function (item) {
      let obj = cloneDeep(defaultPerson);

      for (let key in item) {
        const fieldParts = key.split(".");
        if (fieldParts.length > 1) {
          //If last part is Array
          const isArray = fieldParts[fieldParts.length - 1].indexOf("[");
          const isExtraArray = fieldParts[0].indexOf("[");
          if (isArray >= 0) {
            //Array type
            const newKey = key.substr(0, key.indexOf("["));
            if (!obj.$set["campaignMeta." + newKey]) {
              obj.$set["campaignMeta." + newKey] = [];
            }

            obj.$set["campaignMeta." + newKey].push(item[key]);
          } else if (isExtraArray >= 0) {
            if (!obj.$set["campaignMeta.extra"])
              obj.$set["campaignMeta.extra"] = [];
            const index = fieldParts[0].match(/\d+/)[0];
            if (!obj.$set["campaignMeta.extra"][index])
              obj.$set["campaignMeta.extra"][index] = {};
            obj.$set["campaignMeta.extra"][index][
              fieldParts[fieldParts.length - 1]
            ] = item[key];
          } else {
            if (fieldParts[fieldParts.length - 1] === "birthday") {
              obj.$set["campaignMeta." + key] = moment(item[key]).toDate();
            } else {
              obj.$set["campaignMeta." + key] = item[key];
            }
          }
        } else {
          //root
          if (rootAllowed.includes(key)) {
            obj.$set[key] = item[key];
          }
          if (key === "tags") {
            obj.$set["campaignMeta.basic_info.tags"] = [];
            item[key].split(",").map((tagName) => {
              if (tags[tagName]) {
                obj.$set["campaignMeta.basic_info.tags"].push(tags[tagName]);
              }
            });
          }
        }
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
        let i = 0;
        for (let person of importData) {
          JobsHelpers.addJob({
            jobType: "people.importPerson",
            jobData: {
              idx: i,
              campaignId,
              jobId: job,
              listId,
              person: JSON.stringify(person),
            },
          });
          i++;
        }
      }),
      10
    );
    return;
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
        let i = 0;
        for (let person of importData) {
          JobsHelpers.addJob({
            jobType: "people.importPerson",
            jobData: {
              idx: i,
              campaignId,
              jobId: job,
              listId,
              person: JSON.stringify(person),
            },
          });
          i++;
        }
      }),
      10
    );

    return;
  },
  markUnresolve({ personId, related = null }) {
    let $set = { unresolved: true };
    let $unset = {};
    let $addToSet = {};
    if (related && related.length > 0) {
      $set.related = related;
    } else {
      $unset = { related: [] };
    }
    People.update(personId, { $set, $addToSet, $unset });
  },
  registerDuplicates({ personId, source = "" }) {
    check(personId, String);
    check(source, String);

    let parentID = null;
    let IDs = [];
    //  Call to find duplicctes
  
    //
    // Temporarily disabling this functionality until we solve the performance issue with the query
    //
    // res = this.findDuplicates({ personId, source });
    res = {};
    let persons = [];
    Object.keys(res).map((key) => {
      res[key].map((person) => {
        persons.push(person);
      });
    });
    if (persons.length == 0) {
      return;
    }
    /* Get list of all the duplicates found  */
    persons.map((person) => {
      if (
        (person.related && person.related.length > 0) ||
        (parentID === null && person.facebookAccountId)
      ) {
        parentID = person._id;
      }
      IDs.push(person._id);
    });
    // If we found a parent we keep it as it is
    if (!parentID) {
      parentID = persons[0]._id;
    }
    IDs = IDs.filter((e) => e != parentID);
    IDs.push(personId);

    IDs.map((id) => {
      this.markUnresolve({
        personId: id,
        related: null,
      });
    });
    // The the one thatt will hold the rest
    this.markUnresolve({
      personId: parentID,
      related: IDs,
    });
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
      };
      // avoid matching person with different facebookId (which source is facebook)
      if (person.source == "facebook") {
        defaultQuery.$and = [
          {
            $or: [
              { facebookId: { $exists: false }, source: { $ne: "facebook" } },
              { facebookId: person.facebookId },
            ],
          },
        ];
      }

      // Search query (for score parsing later)
      queries.push({
        ...defaultQuery,
        $text: { $search: person.name },
      });

      // Regex query (for case-insensitive exact match)
      queries.push({
        ...defaultQuery,
        name: {
          $regex: new RegExp(`^${person.name}$`, "i"),
        },
      });

      // Grouping fields for $or operator query
      // Sorted by uniqueness importance
      fieldGroups = [
        ["name"],
        [
          "campaignMeta.contact.email",
          "campaignMeta.contact.cellphone",
          "campaignMeta.social_networks.twitter",
          "campaignMeta.social_networks.instagram",
        ],
      ];
      for (const fieldGroup of fieldGroups) {
        let query = { ...defaultQuery };
        if (!query.$or) query.$or = [];
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
        let options = {};
        if (query.$text) {
          options = {
            fields: { score: { $meta: "textScore" } },
            sort: { score: { $meta: "textScore" } },
          };
        }
        matches.push(People.find(query, options).fetch());
      }
    }

    matches = flatten(matches).filter((person) => {
      return person.score ? person.score > 1.5 : true;
    });
    let grouped = groupBy(uniqBy(matches, "_id"), "facebookId");

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

    // Transform JSON parsed string
    const birthdayKey = "campaignMeta.basic_info.birthday";
    if (person.$set[birthdayKey]) {
      person.$set[birthdayKey] = new Date(person.$set[birthdayKey]);
    }

    // Using upsert because `person` object contain modifiers ($set)
    // This will always be inserted (new person)
    People.upsert(
      { _id, campaignId },
      {
        ...person,
        $setOnInsert: {
          listId,
          source: "import",
          imported: true,
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

    // this.registerDuplicates({ personId: { _id } })
    this.registerDuplicates({ personId: _id, source: "import" });
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
  getPersonId({ campaignId, instagramHandle }) {
    check(campaignId, String);
    check(instagramHandle, String);

    const pattern = "^@?" + instagramHandle + "$";
    let personId;

    const facebookAccount = FacebookAccounts.findOne({
      instagramHandle: { $regex: new RegExp(pattern) },
    });
    if (facebookAccount) {
      personId = facebookAccount.facebookId;
    } else {
      const person = People.findOne({
        $and: [
          { campaignId },
          {
            $or: [
              { "campaignMeta.social_networks.instagram": instagramHandle },
              { "campaignMeta.social_networks.instagram": "@" + instagramHandle }
            ]
          },
        ],
      });

      if (person) {
        personId = person.facebookId;
      } else {
        personId = instagramHandle;
      }
    }

    return personId;
  },
  getPersonName({ campaignId, instagramHandle }) {
    check(campaignId, String);
    check(instagramHandle, String);

    const pattern = "^@?" + instagramHandle + "$";
    let personName;

    const facebookAccount = FacebookAccounts.findOne({
      instagramHandle: { $regex: new RegExp(pattern) },
    });
    if (facebookAccount) {
      personName = facebookAccount.name;
    } else {
      const person = People.findOne({
        $and: [
          { campaignId },
          {
            $or: [
              { "campaignMeta.social_networks.instagram": instagramHandle },
              { "campaignMeta.social_networks.instagram": "@" + instagramHandle }
            ]
          },
        ],
      });

      if (person) {
        personName = person.name;
      } else {
        personName = instagramHandle;
      }
    }

    return personName;
  },
};

exports.PeopleHelpers = PeopleHelpers;
