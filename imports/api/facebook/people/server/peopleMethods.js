import SimpleSchema from "simpl-schema";
import axios from "axios";
import { People, PeopleTags, PeopleLists } from "../people.js";
import { DeauthorizedPeople } from "../deauthorizedPeople.js";
import peopleMetaModel from "/imports/api/facebook/people/model/meta";
import { PeopleHelpers } from "./peopleHelpers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { flattenObject } from "/imports/utils/common.js";
import _ from "underscore";
import moment from "moment";
import { get, set, merge, pick, compact, uniq } from "lodash";
import cep from "cep-promise";
import { Random } from "meteor/random";
import Papa from "papaparse";
import fs from "fs";
import crypto from "crypto";
import mkdirp from "mkdirp";

const recaptchaSecret = Meteor.settings.recaptcha;

export const resolveZipcode = new ValidatedMethod({
  name: "people.resolveZipcode",
  validate: new SimpleSchema({
    country: {
      type: String
    },
    zipcode: {
      type: String
    }
  }).validator(),
  run({ country, zipcode }) {
    this.unblock();

    switch (country) {
      case "BR":
        const match = zipcode.match(/\d+/gi);
        if (match && match.length) {
          const code = match.join("");
          if (code.length == 8) {
            return Promise.await(cep(code));
          }
        }
        return {};
      default:
        let res;
        let data = {};
        try {
          res = Promise.await(
            axios.get(`http://api.zippopotam.us/${country}/${zipcode}`)
          );
          data = res.data;
        } catch (e) {
          return data;
        } finally {
          if (data && data.places && data.places.length) {
            return {
              state: data.places[0]["state abbreviation"],
              city: data.places[0]["place name"]
            };
          }
          return data;
        }
    }
  }
});

const buildSearchQuery = ({ campaignId, rawQuery, options }) => {
  const {
    creation_from,
    creation_to,
    reaction_count,
    reaction_type,
    ...query
  } = rawQuery;
  let queryOptions = {
    skip: options.skip || 0,
    limit: Math.min(options.limit || 20, 50),
    fields: {
      name: 1,
      facebookId: 1,
      campaignId: 1,
      counts: 1,
      campaignMeta: 1,
      lastInteractionDate: 1,
      canReceivePrivateReply: 1,
      receivedAutoPrivateReply: 1,
      filledForm: 1,
      formId: 1,
      createdAt: 1
    }
  };

  if (options.sort) {
    switch (options.sort) {
      case "comments":
      case "likes":
        queryOptions.sort = {
          [`counts.${options.sort}`]: options.order || -1
        };
        break;
      case "name":
        queryOptions.sort = { name: options.order || 1 };
        break;
      case "lastInteraction":
        queryOptions.sort = {
          lastInteractionDate: options.order || -1
        };
        break;
      default:
    }
  }

  query.campaignId = campaignId;

  if (creation_from || creation_to) {
    if (!query.createdAt) query.createdAt = {};
    if (creation_from) {
      query.createdAt["$gte"] = new Date(creation_from);
    }
    if (creation_to) {
      query.createdAt["$lt"] = moment(creation_to)
        .add("1", "day")
        .toDate();
    }
  }

  if (reaction_count) {
    if (!reaction_type || reaction_type == "any" || reaction_type == "all") {
      query[`counts.likes`] = {
        $gte: parseInt(reaction_count)
      };
    } else {
      query[`counts.reactions.${reaction_type}`] = {
        $gte: parseInt(reaction_count)
      };
    }
  }

  if (query.q) {
    query.$text = { $search: query.q };
    if (!queryOptions.sort) {
      queryOptions.fields.score = { $meta: "textScore" };
      queryOptions.sort = { score: { $meta: "textScore" } };
    }
  }
  delete query.q;

  if (query.category) {
    query[`campaignMeta.${query.category}`] = true;
  }
  delete query.category;

  if (query.tag) {
    query[`campaignMeta.basic_info.tags`] = query.tag;
  }
  delete query.tag;

  if (query.form) {
    query["filledForm"] = true;
  }
  delete query.form;

  if (query.commented) {
    query["counts.comments"] = { $gt: 0 };
  }
  delete query.commented;

  if (query.private_reply) {
    query["canReceivePrivateReply"] = { $exists: true };
  }
  delete query.private_reply;

  if (!query.source) delete query.source;

  switch (query.accountFilter) {
    case "account":
      if (options.facebookId) {
        query.facebookAccounts = options.facebookId;
      }
      break;
    case "import":
      query.source = "import";
      break;
  }
  delete query.accountFilter;

  return { query, options: queryOptions };
};

export const peopleSearch = new ValidatedMethod({
  name: "people.search",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    query: {
      type: Object,
      blackbox: true
    },
    options: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, query, options }) {
    this.unblock();
    logger.debug("people.search called", {
      campaignId,
      query,
      options
    });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: query,
      options
    });

    const cursor = People.find(searchQuery.query, searchQuery.options);

    const result = cursor.fetch();

    return result;
  }
});

export const peopleSearchCount = new ValidatedMethod({
  name: "people.search.count",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    query: {
      type: Object,
      blackbox: true
    },
    options: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, query, options }) {
    this.unblock();
    logger.debug("people.search.count called", {
      campaignId,
      query,
      options
    });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: query,
      options
    });

    const result = Promise.await(
      People.rawCollection().count(searchQuery.query)
    );

    return result;
  }
});

export const peopleSummaryCounts = new ValidatedMethod({
  name: "people.summaryCounts",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String,
      optional: true
    },
    queries: {
      type: Array
    },
    "queries.$": {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, facebookId, queries }) {
    logger.debug("peole.summaryCounts called", { queries });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let results = [];

    for (let rawQuery of queries) {
      const query = buildSearchQuery({
        campaignId,
        rawQuery,
        options: {}
      });
      results.push(Promise.await(People.rawCollection().count(query.query)));
    }

    return results;
  }
});

export const peopleReplyComment = new ValidatedMethod({
  name: "people.getReplyComment",
  validate: new SimpleSchema({
    personId: {
      type: String
    },
    facebookAccountId: {
      type: String,
      optional: true
    }
  }).validator(),
  run({ personId, facebookAccountId }) {
    logger.debug("people.getReplyComment called", {
      personId,
      facebookAccountId
    });

    const userId = Meteor.userId();
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }
    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: person.campaignId,
        userId
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(person.campaignId);
    facebookAccountId =
      facebookAccountId || campaign.facebookAccount.facebookId;

    let comment = Comments.findOne(
      {
        personId: person.facebookId,
        facebookAccountId,
        $or: [
          { can_reply_privately: true },
          {
            can_reply_privately: { $exists: false },
            created_time: {
              $gte: moment()
                .subtract(4, "months")
                .toISOString()
            }
          }
        ]
      },
      { sort: { created_time: -1 } }
    );
    // Recheck for reply availability
    if (comment) {
      const campaignAccount =
        campaign.facebookAccount ||
        _.find(
          campaign.accounts,
          account => account.facebookId == facebookAccountId
        );
      if (campaignAccount) {
        const access_token = campaignAccount.accessToken;
        let res;
        try {
          res = Promise.await(
            FB.api(comment._id, {
              fields: ["can_reply_privately"],
              access_token
            })
          );
        } catch (e) {
          if (e.response && e.response.error.code == 190) {
            throw new Meteor.Error(500, "Invalid facebook token");
          } else {
            throw new Meteor.Error(500);
          }
        }
        if (res) {
          Comments.update(
            { _id: comment._id },
            {
              $set: {
                can_reply_privately: res.can_reply_privately
              }
            }
          );
          if (!res.can_reply_privately) {
            People.update(person._id, {
              $pull: { canReceivePrivateReply: facebookAccountId }
            });
            return;
          }
        }
      }
    }

    comment.person = People.findOne({
      facebookId: comment.personId,
      campaignId: campaign._id
    });
    comment.entry = Entries.findOne(comment.entryId);

    return {
      comment,
      defaultMessage: campaign.autoReplyMessage
    };
  }
});

export const peopleSendPrivateReply = new ValidatedMethod({
  name: "people.sendPrivateReply",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    personId: {
      type: String
    },
    commentId: {
      type: String
    },
    type: {
      type: String,
      defaultValue: "custom",
      allowedValues: ["auto", "custom"]
    },
    message: {
      type: String
    }
  }).validator(),
  run({ campaignId, personId, commentId, type, message }) {
    logger.debug("people.sendPrivateReply called", {
      campaignId,
      commentId,
      message
    });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (
      !Meteor.call("campaigns.hasAccount", {
        campaignId,
        facebookId: comment.facebookAccountId
      })
    ) {
      throw new Meteor.Error(
        401,
        "Campaign does not have access to this Facebook Account"
      );
    }

    const campaign = Campaigns.findOne(campaignId);

    if (type == "auto") message = campaign.autoReplyMessage;

    if (!message) {
      throw new Meteor.Error(401, "You must type a message");
    }

    const comment = Comments.findOne(commentId);

    const campaignAccount = _.findWhere(campaign.accounts, {
      facebookId: comment.facebookAccountId
    });

    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }

    if (person.facebookId !== comment.personId) {
      throw new Meteor.Error(401, "Person does not match comment author");
    }

    let response;

    const getFormUrl = () => {
      let formUrl = "";
      const baseUrl = process.env.ROOT_URL;
      const formId = PeopleHelpers.getFormId({ personId });
      formUrl = baseUrl;
      if (!baseUrl.endsWith("/")) formUrl += "/";
      formUrl += `f/${formId}`;
      return formUrl;
    };

    const parseMessage = message => {
      // Replace [form] for the form url
      message = message.replace("[form]", getFormUrl());
      // Replace [name] for the person name
      message = message.replace("[name]", person.name);
      return message;
    };

    const closeComment = () => {
      Comments.update(
        { _id: comment._id },
        {
          $set: {
            can_reply_privately: false
          }
        }
      );
    };

    try {
      response = Promise.await(
        FB.api(`${comment._id}/private_replies`, "POST", {
          access_token: campaignAccount.accessToken,
          id: comment._id,
          message: parseMessage(message)
        })
      );
    } catch (error) {
      if (error instanceof Meteor.Error) {
        throw error;
      } else if (error.response) {
        const errorCode = error.response.error.code;
        switch (errorCode) {
          case 10903:
            closeComment();
            throw new Meteor.Error(400, "You cannot reply to this activity.");
          case 10900:
            closeComment();
            throw new Meteor.Error(
              400,
              "You already sent a private message for this comment."
            );
          case 100:
          case 200:
            closeComment();
            throw new Meteor.Error(
              400,
              "Cannot send message for this comment, probably too old or comment does not exist anymore."
            );
          default:
            throw new Meteor.Error(500, "Unexpected Facebook response.");
        }
      }
    }
    if (type == "auto") {
      People.update(
        { _id: person._id },
        {
          $set: {
            receivedAutoPrivateReply: true
          }
        }
      );
    }
    closeComment();
    return response;
  }
});

export const updatePersonMeta = new ValidatedMethod({
  name: "facebook.people.updatePersonMeta",
  validate: new SimpleSchema({
    personId: {
      type: String
    },
    metaKey: {
      type: String
    },
    metaValue: {
      type: Match.OneOf(String, Boolean)
    }
  }).validator(),
  run({ personId, metaKey, metaValue }) {
    logger.debug("facebook.people.updatePersonMeta called", {
      personId,
      metaKey,
      metaValue
    });

    const userId = Meteor.userId();
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }
    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: person.campaignId,
        userId
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let doc = {};
    doc[`campaignMeta.${metaKey}`] = metaValue;

    if (!person.formId) PeopleHelpers.updateFormId({ person });

    return People.update({ _id: person._id }, { $set: doc });
  }
});

export const getPersonIdFromFacebook = new ValidatedMethod({
  name: "people.getPersonIdFromFacebook",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    facebookId: {
      type: String
    }
  }).validator(),
  run({ campaignId, facebookId }) {
    this.unblock();

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return People.findOne(
      {
        campaignId,
        facebookId
      },
      {
        fields: {
          _id: 1
        }
      }
    );
  }
});

export const peopleFormId = new ValidatedMethod({
  name: "people.formId",
  validate: new SimpleSchema({
    personId: {
      type: String
    },
    regenerate: {
      type: Boolean,
      optional: true
    }
  }).validator(),
  run({ personId, regenerate }) {
    logger.debug("people.formId called", { personId });

    const person = People.findOne(personId);
    const campaignId = person.campaignId;

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (!person) {
      throw new Meteor.Error(400, "Person not found");
    }

    let formId = person.formId;

    if (!formId || regenerate) formId = PeopleHelpers.updateFormId({ person });

    return {
      formId,
      filledForm: person.filledForm
    };
  }
});

export const peopleCreate = new ValidatedMethod({
  name: "people.create",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    name: {
      type: String
    }
  }).validator(),
  run({ campaignId, name }) {
    logger.debug("people.create called", { campaignId, name });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return People.insert({
      campaignId,
      name
    });
  }
});

export const peopleMetaUpdate = new ValidatedMethod({
  name: "people.metaUpdate",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    personId: {
      type: String
    },
    name: {
      type: String,
      optional: true
    },
    sectionKey: {
      type: String
    },
    data: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, personId, name, sectionKey, data }) {
    logger.debug("people.metaUpdate called", {
      campaignId,
      personId,
      name,
      sectionKey,
      data
    });

    let $set = {};
    let $unset = {};

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }

    if (person.campaignId !== campaignId) {
      throw new Meteor.Error(401, "Not allowed");
    }

    if (!person.formId) PeopleHelpers.updateFormId({ person });

    if (data.address) {
      let location;
      try {
        location = Promise.await(
          PeopleHelpers.geocode({ address: data.address })
        );
      } catch (e) {
        logger.debug("people.metaUpdate - Not able to fetch location");
        $unset.location = "";
      } finally {
        if (location) {
          $set.location = location;
        }
      }
    }

    if (name) {
      $set.name = name;
    }

    let update = {};

    $set = {
      ...$set,
      [`campaignMeta.${sectionKey}`]: data
    };

    if (Object.keys($set).length) {
      update.$set = $set;
    }

    if (Object.keys($unset).length) {
      update.$unset = $unset;
    }

    People.update(
      {
        campaignId,
        _id: personId
      },
      update
    );

    return People.findOne(personId);
  }
});

export const removePeople = new ValidatedMethod({
  name: "people.remove",
  validate: new SimpleSchema({
    personId: {
      type: String
    }
  }).validator(),
  run({ personId }) {
    logger.debug("people.remove called", { personId });

    const userId = Meteor.userId();
    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }

    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: person.campaignId,
        userId
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    People.remove(personId);
  }
});

export const exportPeople = new ValidatedMethod({
  name: "people.export",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    rawQuery: {
      type: Object,
      blackbox: true,
      optional: true
    },
    options: {
      type: Object,
      blackbox: true,
      optional: true
    }
  }).validator(),
  run({ campaignId, rawQuery, options }) {
    this.unblock();
    logger.debug("people.export called", { campaignId, rawQuery, options });

    let searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: rawQuery || {},
      options: options || {}
    });

    if (searchQuery.query.$text) {
      searchQuery.options.projection = {
        score: { $meta: "textScore" }
      };
    }

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let header = {};

    const fileKey = crypto
      .createHash("sha1")
      .update(campaignId + JSON.stringify(rawQuery) + new Date().getTime())
      .digest("hex")
      .substr(0, 7);

    const batchInterval = 10000;

    const totalCount = Promise.await(
      People.rawCollection()
        .find(searchQuery.query, {
          ...searchQuery.options,
          ...{
            limit: 0,
            fields: {
              name: 1,
              facebookId: 1,
              campaignMeta: 1,
              counts: 1
            }
          }
        })
        .count()
    );

    const batchAmount = Math.ceil(totalCount / batchInterval);

    // first batch run get all headers
    for (let i = 0; i < batchAmount; i++) {
      const limit = batchInterval;
      const skip = batchInterval * i;
      Promise.await(
        new Promise((resolve, reject) => {
          People.rawCollection()
            .find(searchQuery.query, {
              ...searchQuery.options,
              ...{
                limit: limit,
                skip: skip,
                fields: {
                  name: 1,
                  facebookId: 1,
                  campaignMeta: 1,
                  counts: 1
                }
              }
            })
            .forEach(
              person => {
                if (person.campaignMeta) {
                  for (let key in person.campaignMeta) {
                    person[key] = person.campaignMeta[key];
                  }
                  delete person.campaignMeta;
                }
                const flattenedPerson = flattenObject(person);
                for (let key in flattenedPerson) {
                  header[key] = true;
                }
              },
              err => {
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
        mkdirp(fileDir, err => {
          if (err) {
            reject(err);
          } else {
            fs.writeFile(filePath, header.join(",") + "\r\n", "utf-8", err => {
              if (err) reject(err);
              else resolve();
            });
          }
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
            .find(searchQuery.query, {
              ...searchQuery.options,
              ...{
                limit,
                skip,
                fields: {
                  name: 1,
                  facebookId: 1,
                  campaignMeta: 1,
                  counts: 1
                }
              }
            })
            .forEach(
              person => {
                if (person.campaignMeta) {
                  for (let key in person.campaignMeta) {
                    person[key] = person.campaignMeta[key];
                  }
                  delete person.campaignMeta;
                }
                flattened.push(flattenObject(person));
              },
              err => {
                if (err) {
                  reject(err);
                } else {
                  writeStream.write(
                    Papa.unparse(
                      {
                        fields: header,
                        data: flattened
                      },
                      {
                        header: false
                      }
                    ) + "\r\n",
                    "utf-8"
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

    // Create job to delete export file
    JobsHelpers.addJob({
      jobType: "people.removeExportFile",
      jobData: {
        path: filePath
      }
    });

    return url;
  }
});

export const importPeople = new ValidatedMethod({
  name: "people.import",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    config: {
      type: Object,
      blackbox: true
    },
    filename: {
      type: String
    },
    data: {
      type: Object,
      blackbox: true
    },
    defaultValues: {
      type: Object,
      optional: true
    },
    "defaultValues.tags": {
      type: Array,
      optional: true
    },
    "defaultValues.tags.$": {
      type: String
    },
    "defaultValues.labels": {
      type: Object,
      optional: true,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, config, filename, data, defaultValues }) {
    logger.debug("people.import called", {
      campaignId,
      config,
      data,
      defaultValues
    });

    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return PeopleHelpers.import({
      campaignId,
      config,
      filename,
      data,
      defaultValues
    });
  }
});

export const findDuplicates = new ValidatedMethod({
  name: "people.findDuplicates",
  validate: new SimpleSchema({
    personId: {
      type: String
    }
  }).validator(),
  run({ personId }) {
    logger.debug("people.findDuplicates called", { personId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }

    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: person.campaignId,
        userId
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return PeopleHelpers.findDuplicates({ personId });
  }
});

export const mergePeople = new ValidatedMethod({
  name: "people.merge",
  validate: new SimpleSchema({
    personId: {
      type: String
    },
    merged: {
      type: Object,
      blackbox: true
    },
    from: {
      type: Array
    },
    "from.$": {
      type: String
    },
    remove: {
      type: Boolean
    }
  }).validator(),
  run({ personId, merged, from, remove }) {
    logger.debug("people.merge called", { personId, merged, from, remove });

    const userId = Meteor.userId();

    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }

    if (
      !Meteor.call("campaigns.canManage", {
        campaignId: person.campaignId,
        userId
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (merged._id !== person._id) {
      throw new Meteor.Error(401, "Merging object ID does not match");
    }

    const autoFields = [
      "facebookId",
      "counts",
      "facebookAccounts",
      "lastInteractionDate"
    ];

    const people = People.find({
      campaignId: person.campaignId,
      _id: { $in: from }
    }).fetch();

    const uniqFacebookIds = compact(
      uniq([person.facebookId, ...people.map(p => p.facebookId)])
    );

    if (uniqFacebookIds.length > 1) {
      throw new Meteor.Error(
        401,
        "You cannot merge people from different existing Facebook references"
      );
    }

    let $set = {};

    merge(
      $set,
      ...people.map(p => pick(p, autoFields)),
      pick(merged, autoFields)
    );

    let mergeFields = ["name"];
    for (const section of peopleMetaModel) {
      for (const field of section.fields) {
        mergeFields.push(`campaignMeta.${section.key}.${field.key}`);
      }
    }

    for (const field of mergeFields) {
      const value = get(merge, field);
      if (value) {
        $set[field] = value;
      }
    }

    People.update(
      {
        _id: person._id
      },
      {
        $set
      }
    );

    if (remove) {
      People.remove({
        campaignId: person.campaignId,
        _id: { $in: from }
      });
    }

    return;
  }
});

export const peopleFormConnectFacebook = new ValidatedMethod({
  name: "peopleForm.connectFacebook",
  validate: new SimpleSchema({
    token: {
      type: String
    },
    secret: {
      type: String
    },
    campaignId: {
      type: String
    }
  }).validator(),
  run({ token, secret, campaignId }) {
    logger.debug("peopleForm.connectFacebook called", {
      token,
      secret,
      campaignId
    });

    const credential = Facebook.retrieveCredential(token, secret);

    if (credential.serviceData && credential.serviceData.accessToken) {
      const data = Promise.await(
        FB.api("me", {
          fields: ["id", "name", "email"],
          access_token: credential.serviceData.accessToken
        })
      );
      if (data && data.id) {
        People.upsert(
          { campaignId, facebookId: data.id },
          {
            $set: {
              campaignId,
              name: data.name,
              "campaignMeta.contact.email": data.email
            }
          }
        );
        const person = People.findOne({ campaignId, facebookId: data.id });
        let formId = person.formId;
        if (!formId) formId = PeopleHelpers.updateFormId({ person });
        return formId;
      }
    }
    throw new Meteor.Error(500, "Error fetching user data");
  }
});

export const peopleFormSubmit = new ValidatedMethod({
  name: "peopleForm.submit",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    formId: {
      type: String,
      optional: true
    },
    recaptcha: {
      type: String,
      optional: true
    },
    name: {
      type: String
    },
    email: {
      type: String
    },
    cellphone: {
      type: String,
      optional: true
    },
    birthday: {
      type: String,
      optional: true
    },
    address: {
      type: Object,
      optional: true
    },
    "address.country": {
      type: String
    },
    "address.zipcode": {
      type: String,
      optional: true
    },
    "address.region": {
      type: String,
      optional: true
    },
    "address.city": {
      type: String,
      optional: true
    },
    "address.neighbourhood": {
      type: String,
      optional: true
    },
    "address.street": {
      type: String,
      optional: true
    },
    "address.number": {
      type: String,
      optional: true
    },
    "address.complement": {
      type: String,
      optional: true
    },
    skills: {
      type: Array,
      optional: true
    },
    "skills.$": {
      type: String
    },
    supporter: {
      type: Boolean,
      optional: true
    },
    mobilizer: {
      type: Boolean,
      optional: true
    },
    donor: {
      type: Boolean,
      optional: true
    }
  }).validator(),
  run(formData) {
    const { campaignId, formId, recaptcha, ...data } = formData;
    logger.debug("peopleForm.submit called", { campaignId, formId });

    let $set = {
      filledForm: true
    };
    let $unset = {};

    for (const key in data) {
      switch (key) {
        case "email":
        case "cellphone":
          $set[`campaignMeta.contact.${key}`] = data[key];
          break;
        case "address":
        case "birthday":
        case "skills":
          $set[`campaignMeta.basic_info.${key}`] = data[key];
          break;
        case "supporter":
        case "mobilizer":
        case "donor":
          $set[`campaignMeta.${key}`] = data[key];
        default:
          $set[key] = data[key];
      }
    }

    if (!formId && recaptchaSecret) {
      if (recaptcha) {
        const res = Promise.await(
          axios.request({
            url: "https://www.google.com/recaptcha/api/siteverify",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            method: "post",
            params: {
              secret: recaptchaSecret,
              response: recaptcha
            }
          })
        );
        if (!res.data.success) {
          throw new Meteor.Error(400, "Invalid recaptcha");
        }
      } else {
        throw new Meteor.Error(400, "Make sure you are not a robot");
      }
    }

    if (data.address) {
      let location;
      try {
        location = Promise.await(
          PeopleHelpers.geocode({ address: data.address })
        );
      } catch (e) {
        $unset.location = "";
      } finally {
        if (location) {
          $set.location = location;
        }
      }
    }

    let newFormId;

    let update = {};

    if (Object.keys($set).length) {
      update.$set = $set;
    }
    if (Object.keys($unset).length) {
      update.$unset = $unset;
    }

    if (formId) {
      const person = People.findOne({ formId });
      if (!person) {
        throw new Meteor.Error(400, "Unauthorized request");
      }
      People.update({ formId }, update);
      newFormId = PeopleHelpers.getFormId({
        personId: person._id,
        generate: true
      });
    } else {
      const id = Random.id();
      People.upsert(
        {
          campaignId,
          _id: id
        },
        {
          ...update,
          $setOnInsert: {
            source: "form"
          }
        }
      );
      newFormId = PeopleHelpers.getFormId({
        personId: id,
        generate: true
      });
    }
    return newFormId;
  }
});

export const peopleGetTags = new ValidatedMethod({
  name: "people.getTags",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    logger.debug("people.getTags called", { campaignId });
    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return PeopleTags.find({ campaignId }).fetch();
  }
});

export const peopleCreateTag = new ValidatedMethod({
  name: "people.createTag",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    name: {
      type: String
    }
  }).validator(),
  run({ campaignId, name }) {
    logger.debug("peopleTags.create called", { campaignId });
    const userId = Meteor.userId();
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return PeopleTags.insert({ campaignId, name });
  }
});

export const peopleListsCount = new ValidatedMethod({
  name: "peopleLists.peopleCount",
  validate: new SimpleSchema({
    listId: {
      type: String
    }
  }).validator(),
  run({ listId }) {
    logger.debug("peopleLists.peopleCount called", { listId });
    const userId = Meteor.userId();
    const list = PeopleLists.findOne(listId);
    if (!list) {
      throw new Meteor.Error(404, "List not found");
    }
    const campaignId = list.campaignId;
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return People.find({ listId }).count();
  }
});

export const peopleListsRemove = new ValidatedMethod({
  name: "peopleLists.remove",
  validate: new SimpleSchema({
    listId: {
      type: String
    }
  }).validator(),
  run({ listId }) {
    logger.debug("peopleLists.peopleCount called", { listId });
    const userId = Meteor.userId();
    const list = PeopleLists.findOne(listId);
    if (!list) {
      throw new Meteor.Error(404, "List not found");
    }
    const campaignId = list.campaignId;
    if (!Meteor.call("campaigns.canManage", { campaignId, userId })) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    People.remove({ listId });
    return PeopleLists.remove(listId);
  }
});
