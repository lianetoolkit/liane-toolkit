import SimpleSchema from "simpl-schema";
import axios from "axios";
import { People, PeopleTags, PeopleLists } from "../people.js";
import { DeauthorizedPeople } from "../deauthorizedPeople.js";
import peopleMetaModel from "/imports/api/facebook/people/model/meta";
import { PeopleHelpers } from "./peopleHelpers.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { CommentsHelpers } from "/imports/api/facebook/comments/server/commentsHelpers.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { NotificationsHelpers } from "/imports/api/notifications/server/notificationsHelpers";
import _ from "underscore";
import moment from "moment";
import { get, set, merge, pick, compact, uniq } from "lodash";
import cep from "cep-promise";
import { Random } from "meteor/random";
import redisClient from "/imports/startup/server/redis";
import crypto from "crypto";

const recaptchaSecret = Meteor.settings.recaptcha;
export const peopleDetail = new ValidatedMethod({
  name: "people.detail",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
  }).validator(),
  run({ personId }) {
    logger.debug("people.detail called", { personId });

    const userId = Meteor.userId();
    const person = People.findOne(personId);

    if (!person) throw new Meteor.Error(404, "Person not found");

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    )
      throw new Meteor.Error(400, "Not allowed");

    person.tags = PeopleTags.find({
      _id: { $in: get(person, "campaignMeta.basic_info.tags") },
    }).fetch();

    return person;
  },
});

export const resolveZipcode = new ValidatedMethod({
  name: "people.resolveZipcode",
  validate: new SimpleSchema({
    country: {
      type: String,
    },
    zipcode: {
      type: String,
    },
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
              city: data.places[0]["place name"],
            };
          }
          return data;
        }
    }
  },
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
      facebookAccountId: 1,
      campaignId: 1,
      counts: 1,
      campaignMeta: 1,
      lastInteractionDate: 1,
      canReceivePrivateReply: 1,
      receivedAutoPrivateReply: 1,
      filledForm: 1,
      formId: 1,
      createdAt: 1,
    },
  };

  if (options.sort) {
    switch (options.sort) {
      case "comments":
        queryOptions.sort = {
          [`counts.${options.sort}`]: options.order || -1,
        };
        break;
      case "likes":
        queryOptions.sort = {
          [`counts.facebook.${options.sort}`]: options.order || -1,
        };
        break;
      case "name":
        queryOptions.sort = { name: options.order || 1 };
        break;
      case "lastInteraction":
        queryOptions.sort = {
          lastInteractionDate: options.order || -1,
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
      query.createdAt["$lt"] = moment(creation_to).add("1", "day").toDate();
    }
  }

  if (reaction_count) {
    if (!reaction_type || reaction_type == "any" || reaction_type == "all") {
      query[`counts.facebook.likes`] = {
        $gte: parseInt(reaction_count),
      };
    } else {
      query[`counts.facebook.reactions.${reaction_type}`] = {
        $gte: parseInt(reaction_count),
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

  if (query.starred) {
    query["campaignMeta.starred"] = true;
  }
  delete query.starred;

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
    query["canReceivePrivateReply.0"] = { $exists: true };
  }
  delete query.private_reply;

  if (query.source) {
    if (/list:/.test(query.source)) {
      query.listId = query.source.split("list:")[1];
      delete query.source;
    }
  } else {
    delete query.source;
  }

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
      type: String,
    },
    query: {
      type: Object,
      blackbox: true,
    },
    options: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, query, options }) {
    this.unblock();
    logger.debug("people.search called", {
      campaignId,
      query,
      options,
    });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: query,
      options,
    });

    const cursor = People.find(searchQuery.query, {
      ...searchQuery.options,
      transform: (person) => {
        if (person.facebookId) {
          person.latestComment = Comments.findOne(
            { personId: person.facebookId, source: "facebook" },
            { sort: { created_time: -1 } }
          );
        }
        return person;
      },
    });

    const result = cursor.fetch();

    return result;
  },
});

export const peopleSearchCount = new ValidatedMethod({
  name: "people.search.count",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    query: {
      type: Object,
      blackbox: true,
    },
    options: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, query, options }) {
    this.unblock();
    logger.debug("people.search.count called", {
      campaignId,
      query,
      options,
    });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: query,
      options,
    });

    const result = Promise.await(
      People.rawCollection().count(searchQuery.query)
    );

    return result;
  },
});

export const peopleHistory = new ValidatedMethod({
  name: "people.history",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("people.history called", { campaignId });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);

    const oneDay = 24 * 60 * 60 * 1000;

    // Loop starts a day after campaign creation
    let fromDate = new Date(campaign.createdAt);
    fromDate.setDate(fromDate.getDate() + 1);

    // Loop ends yesterday
    let toDate = new Date();
    toDate.setDate(toDate.getDate() - 1);

    const diffDays = Math.ceil(
      Math.abs((fromDate.getTime() - toDate.getTime()) / oneDay)
    );

    const redisKey = `people.history.${campaignId}`;

    let history;
    history = history ? JSON.parse(history) : {};

    let total = 0;

    if (diffDays <= 4) {
      return { total, history };
    }

    if (diffDays > 14) {
      fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 15);
    }

    for (let d = fromDate; d <= toDate; d.setDate(d.getDate() + 1)) {
      const formattedDate = moment(d).format("YYYY-MM-DD");
      if (!history.hasOwnProperty(formattedDate)) {
        history[formattedDate] = People.find({
          campaignId,
          source: { $in: ["facebook", "instagram"] },
          imported: { $ne: true },
          createdAt: {
            $gte: moment(formattedDate).toDate(),
            $lte: moment(formattedDate).add(1, "day").toDate(),
          },
        }).count();
      }
      total += history[formattedDate];
    }

    redisClient.setSync(redisKey, JSON.stringify(history));

    return { total, history };
  },
});

export const peopleSummaryCounts = new ValidatedMethod({
  name: "people.summaryCounts",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    facebookId: {
      type: String,
      optional: true,
    },
    queries: {
      type: Array,
    },
    "queries.$": {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, facebookId, queries }) {
    logger.debug("peole.summaryCounts called", { queries });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let results = [];

    for (let rawQuery of queries) {
      const query = buildSearchQuery({
        campaignId,
        rawQuery,
        options: {},
      });
      results.push(Promise.await(People.rawCollection().count(query.query)));
    }

    return results;
  },
});

export const peopleReplyComment = new ValidatedMethod({
  name: "people.getReplyComment",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    facebookAccountId: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ personId, facebookAccountId }) {
    logger.debug("people.getReplyComment called", {
      personId,
      facebookAccountId,
    });

    const userId = Meteor.userId();
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "comments",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(person.campaignId);
    facebookAccountId =
      facebookAccountId || campaign.facebookAccount.facebookId;

    const campaignAccount =
      campaign.facebookAccount ||
      _.find(
        campaign.accounts,
        (account) => account.facebookId == facebookAccountId
      );

    if (!campaignAccount) {
      throw new Meteor.Error(500, "Campaign account not found");
    }

    let comment, fbRes;

    const getComment = () => {
      comment = Comments.findOne(
        {
          personId: person.facebookId,
          facebookAccountId,
          $or: [
            { can_reply_privately: true },
            {
              can_reply_privately: { $exists: false },
              created_time: {
                $gte: moment().subtract(4, "months").toISOString(),
              },
            },
          ],
        },
        { sort: { created_time: -1 } }
      );
    };

    const validateFB = () => {
      const access_token = campaignAccount.accessToken;
      if (!comment) return;
      if (
        comment.lastValidation &&
        moment(comment.lastValidation).isSame(moment.now(), "day")
      ) {
        return;
      }
      try {
        fbRes = Promise.await(
          FB.api(comment._id, {
            fields: ["can_reply_privately"],
            access_token,
          })
        );
      } catch (e) {
        if (e.response) {
          const error = e.response.error;
          if (error.code == 190) {
            throw new Meteor.Error(500, "Invalid facebook token");
          } else if (error.error_subcode == 33) {
            // Comment does not exist
            CommentsHelpers.removeComment({
              facebookAccountId,
              data: comment._id,
            });
            getComment();
            validateFB();
          } else {
            throw new Meteor.Error(500, error.message);
          }
        } else {
          throw new Meteor.Error(500, e);
        }
      }
    };

    getComment();
    validateFB();

    if (comment) {
      if (fbRes) {
        Comments.update(
          { _id: comment._id },
          {
            $set: {
              lastValidation: new Date(),
              can_reply_privately: fbRes.can_reply_privately,
            },
          }
        );
        if (!fbRes.can_reply_privately) {
          People.update(person._id, {
            $pull: { canReceivePrivateReply: facebookAccountId },
          });
          return;
        }
      }
      comment.person = People.findOne({
        facebookId: comment.personId,
        campaignId: campaign._id,
      });
      comment.entry = Entries.findOne(comment.entryId);
    }

    return {
      comment,
      defaultMessage: campaign.autoReplyMessage,
    };
  },
});

export const peopleSendPrivateReply = new ValidatedMethod({
  name: "people.sendPrivateReply",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    personId: {
      type: String,
    },
    commentId: {
      type: String,
    },
    message: {
      type: String,
    },
  }).validator(),
  run({ campaignId, personId, commentId, message }) {
    logger.debug("people.sendPrivateReply called", {
      campaignId,
      commentId,
      message,
    });

    const userId = Meteor.userId();

    const comment = Comments.findOne(commentId);

    if (!message) {
      throw new Meteor.Error(401, "You must type a message");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "comments",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(
        401,
        "Campaign does not have access to this Facebook Account"
      );
    }

    const campaign = Campaigns.findOne(campaignId);

    const campaignAccount = campaign.facebookAccount;

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

    const parseMessage = (message) => {
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
            can_reply_privately: false,
          },
        }
      );
    };

    try {
      response = Promise.await(
        FB.api("me/messages", "POST", {
          access_token: campaignAccount.accessToken,
          recipient: {
            comment_id: comment._id,
          },
          message: {
            text: parseMessage(message),
          },
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
    // if (type == "auto") {
    //   People.update(
    //     { _id: person._id },
    //     {
    //       $set: {
    //         receivedAutoPrivateReply: true
    //       }
    //     }
    //   );
    // }
    closeComment();
    Meteor.call("log", {
      type: "comments.privateReply",
      campaignId,
      data: { personId, commentId },
    });
    return response;
  },
});

export const updatePersonMeta = new ValidatedMethod({
  name: "facebook.people.updatePersonMeta",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    metaKey: {
      type: String,
    },
    metaValue: {
      type: Match.OneOf(String, Boolean),
    },
  }).validator(),
  run({ personId, metaKey, metaValue }) {
    logger.debug("facebook.people.updatePersonMeta called", {
      personId,
      metaKey,
      metaValue,
    });

    const userId = Meteor.userId();
    const person = People.findOne(personId);
    if (!person) {
      throw new Meteor.Error(401, "Person not found");
    }
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "categorize",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    let doc = {};
    doc[`campaignMeta.${metaKey}`] = metaValue;

    if (!person.formId) PeopleHelpers.updateFormId({ person });

    const res = People.update({ _id: person._id }, { $set: doc });

    Meteor.call("log", {
      type: "people.categoryUpdate",
      campaignId: person.campaignId,
      data: { personId, key: metaKey, value: metaValue },
    });

    return res;
  },
});

export const updateTags = new ValidatedMethod({
  name: "people.updateTags",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    tags: {
      type: Array,
    },
    "tags.$": {
      type: String,
    },
  }).validator(),
  run({ personId, tags }) {
    logger.debug("person.tags called", { personId, tags });

    const userId = Meteor.userId();

    const person = People.findOne(personId);

    const campaignId = person.campaignId;

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "categorize",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    People.update(personId, {
      $set: {
        "campaignMeta.basic_info.tags": tags,
      },
    });
  },
});

export const getPersonIdFromFacebook = new ValidatedMethod({
  name: "people.getPersonIdFromFacebook",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    facebookId: {
      type: String,
    },
  }).validator(),
  run({ campaignId, facebookId }) {
    this.unblock();

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return People.findOne(
      {
        campaignId,
        facebookId,
      },
      {
        fields: {
          _id: 1,
        },
      }
    );
  },
});

export const peopleFormId = new ValidatedMethod({
  name: "people.formId",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    regenerate: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run({ personId, regenerate }) {
    logger.debug("people.formId called", { personId });

    const person = People.findOne(personId);
    const campaignId = person.campaignId;

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (!person) {
      throw new Meteor.Error(400, "Person not found");
    }

    let formId = person.formId;

    if (!formId || regenerate) {
      formId = PeopleHelpers.updateFormId({ person });
      Meteor.call("log", {
        type: "people.updateForm",
        campaignId,
        data: { personId },
      });
    }

    return {
      formId,
      filledForm: person.filledForm,
    };
  },
});

export const peopleCreate = new ValidatedMethod({
  name: "people.create",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    name: {
      type: String,
    },
  }).validator(),
  run({ campaignId, name }) {
    logger.debug("people.create called", { campaignId, name });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (!name) {
      throw new Meteor.Error(400, "You must provide a name");
    }

    const res = People.insert({
      campaignId,
      name,
      source: "manual",
    });

    Meteor.call("log", {
      type: "people.add",
      campaignId,
      data: { personId: res },
    });

    return res;
  },
});

export const peopleMetaUpdate = new ValidatedMethod({
  name: "people.metaUpdate",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    personId: {
      type: String,
    },
    name: {
      type: String,
      optional: true,
    },
    sectionKey: {
      type: String,
    },
    data: {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, personId, name, sectionKey, data }) {
    logger.debug("people.metaUpdate called", {
      campaignId,
      personId,
      name,
      sectionKey,
      data,
    });

    let $set = {};
    let $unset = {};

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "edit",
      })
    ) {
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

    if (sectionKey == "extra") {
      $set = {
        ...$set,
        [`campaignMeta.${sectionKey}`]: data.extra,
      };
    } else {
      $set = {
        ...$set,
        [`campaignMeta.${sectionKey}`]: data,
      };
    }

    if (Object.keys($set).length) {
      update.$set = $set;
    }

    if (Object.keys($unset).length) {
      update.$unset = $unset;
    }

    People.update(
      {
        campaignId,
        _id: personId,
      },
      update
    );

    Meteor.call("log", {
      type: "people.edit",
      campaignId,
      data: { personId },
    });

    //! Once its created or updated tries to find a duplicate
    PeopleHelpers.registerDuplicates({ personId });
    return People.findOne(personId);
  },
});

export const removePeople = new ValidatedMethod({
  name: "people.remove",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
  }).validator(),
  run({ personId }) {
    logger.debug("people.remove called", { personId });

    const userId = Meteor.userId();
    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    People.remove(personId);

    Meteor.call("log", {
      type: "people.remove",
      campaignId: person.campaignId,
      data: { personId },
    });
  },
});

export const exportPeople = new ValidatedMethod({
  name: "people.export",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    rawQuery: {
      type: Object,
      blackbox: true,
      optional: true,
    },
    options: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ campaignId, rawQuery, options }) {
    this.unblock();
    logger.debug("people.export called", { campaignId, rawQuery, options });

    let searchQuery = buildSearchQuery({
      campaignId,
      rawQuery: rawQuery || {},
      options: options || {},
    });

    if (searchQuery.query.$text) {
      searchQuery.options.projection = {
        score: { $meta: "textScore" },
      };
    }

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "export",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    JobsHelpers.addJob({
      jobType: "people.export",
      jobData: {
        campaignId,
        query: JSON.stringify(searchQuery),
      },
    });

    Meteor.call("log", {
      type: "people.export",
      campaignId,
      data: searchQuery,
    });
  },
});
export const importPeopleLiane = new ValidatedMethod({
  name: "people.import.liane",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    filename: {
      type: String,
    },
    data: {
      type: Array,
    },
    "data.$": {
      type: Object,
      blackbox: true,
    },
  }).validator(),
  run({ campaignId, filename, data }) {
    logger.debug("people.import.liane", {
      campaignId,
    });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "import",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    if (data.length > 10000) {
      throw new Meteor.Error(
        401,
        "You can't import more than 10,000 people at once"
      );
    }
    setTimeout(
      Meteor.bindEnvironment(() => {
        PeopleHelpers.lianeImport({
          campaignId,
          filename,
          data,
        });
      }),
      10
    );

    return true;
  },
});

export const importPeople = new ValidatedMethod({
  name: "people.import",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    config: {
      type: Object,
      blackbox: true,
    },
    filename: {
      type: String,
    },
    data: {
      type: Array,
    },
    "data.$": {
      type: Object,
      blackbox: true,
    },
    defaultValues: {
      type: Object,
      optional: true,
    },
    "defaultValues.tags": {
      type: Array,
      optional: true,
    },
    "defaultValues.tags.$": {
      type: String,
    },
    "defaultValues.labels": {
      type: Object,
      optional: true,
      blackbox: true,
    },
    "defaultValues.country": {
      type: String,
      optional: true,
    },
    "defaultValues.region": {
      type: String,
      optional: true,
    },
    "defaultValues.city": {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ campaignId, config, filename, data, defaultValues }) {
    logger.debug("people.import called", {
      campaignId,
      config,
      defaultValues,
    });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "import",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (data.length > 10000) {
      throw new Meteor.Error(
        401,
        "You can't import more than 10,000 people at once"
      );
    }

    setTimeout(
      Meteor.bindEnvironment(() => {
        PeopleHelpers.import({
          campaignId,
          config,
          filename,
          data,
          defaultValues,
        });
      }),
      10
    );

    Meteor.call("log", {
      type: "people.import.add",
      campaignId,
      data: { defaultValues, importSize: data.length },
    });

    return true;
  },
});

Object.byString = function (o, s) {
  s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
  s = s.replace(/^\./, ""); // strip a leading dot
  var a = s.split(".");
  for (var i = 0, n = a.length; i < n; ++i) {
    var k = a[i];
    if (k in o) {
      o = o[k];
    } else {
      return;
    }
  }
  return o;
};

export const mergeUnresolvedPeople = new ValidatedMethod({
  name: "people.merge.unresolved",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    update: {
      type: Object,
      blackbox: true,
    },
    remove: {
      type: Array,
    },
    "remove.$": {
      type: String,
    },
    resolve: {
      type: Array,
    },
    "resolve.$": {
      type: String,
    },
  }).validator(),
  run({ campaignId, update, remove, resolve }) {
    logger.debug("people.merge.unresolved", {
      campaignId,
      update,
      remove,
      resolve,
    });

    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: campaignId,
        userId,
        feature: "people",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    // Update Resolve
    const $set = {
      unresolved: false,
    };
    resolve.map((personId) => {
      People.update(
        {
          _id: personId,
        },
        {
          $set,
        }
      );
    });
    // Update
    let $updateSet = {
      unresolved: false,
    };
    let $updatePush = {};
    const extra = [];
    update.fields.map(({ field, id }) => {
      if (id != update.id) {
        const valueFrom = People.findOne(id);
        if (field.indexOf("campaignMeta.extra") == 0) {
          const extraKey = field.split("campaignMeta.extra.")[1];
          extra.push({
            key: extraKey,
            val: valueFrom.campaignMeta.extra.find(
              (item) => item.key == extraKey
            ).val,
          });
        } else {
          $updateSet[field] = Object.byString(valueFrom, field);
        }
      }
    });
    if (extra.length) {
      $updatePush["campaignMeta.extra"] = {
        $each: extra,
      };
    }
    People.update(
      {
        _id: update.id,
      },
      {
        $set: $updateSet,
        $push: $updatePush,
        $unset: { related: [] },
      }
    );
    // Update counts
    const campaign = Campaigns.findOne(campaignId);
    const counts = PeopleHelpers.getInteractionCount({
      sourceId: update.id,
      facebookAccountId: campaign.facebookAccount.facebookId,
    });
    People.update(
      { _id: update.id },
      {
        $set: {
          "counts.facebook": counts.facebook,
          "counts.instagram": counts.instagram,
          "counts.comments": counts.comments,
        },
      }
    );
    // Delete
    const removeObj = {
      campaignId: campaignId,
      _id: { $in: remove },
    };
    People.remove(removeObj);

    return;
  },
});

export const mergePeople = new ValidatedMethod({
  name: "people.merge",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    merged: {
      type: Object,
      blackbox: true,
    },
    from: {
      type: Array,
    },
    "from.$": {
      type: String,
    },
    remove: {
      type: Boolean,
    },
  }).validator(),
  run({ personId, merged, from, remove }) {
    logger.debug("people.merge called", { personId, merged, from, remove });

    const userId = Meteor.userId();

    const person = People.findOne(personId);

    if (!person) {
      throw new Meteor.Error(404, "Person not found");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        campaignId: person.campaignId,
        userId,
        feature: "people",
        permission: "edit",
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
      "lastInteractionDate",
    ];

    const people = People.find({
      campaignId: person.campaignId,
      _id: { $in: from },
    }).fetch();

    const uniqFacebookIds = compact(
      uniq([person.facebookId, ...people.map((p) => p.facebookId)])
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
      ...people.map((p) => pick(p, autoFields)),
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
        _id: person._id,
      },
      {
        $set,
      }
    );

    if (remove) {
      People.remove({
        campaignId: person.campaignId,
        _id: { $in: from },
      });
    }

    Meteor.call("log", {
      type: "people.merge",
      campaignId: person.campaignId,
      data: { personId },
    });

    return;
  },
});

export const peopleFormConnectFacebook = new ValidatedMethod({
  name: "peopleForm.connectFacebook",
  validate: new SimpleSchema({
    token: {
      type: String,
    },
    secret: {
      type: String,
    },
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ token, secret, campaignId }) {
    logger.debug("peopleForm.connectFacebook called", {
      campaignId,
    });

    const credential = Facebook.retrieveCredential(token, secret);

    const campaign = Campaigns.findOne(campaignId);
    const pageToken = campaign.facebookAccount.accessToken;

    const secretProof = crypto.createHmac(
      "sha256",
      Meteor.settings.facebook.clientSecret
    );

    if (credential.serviceData && credential.serviceData.accessToken) {
      let data, pagesIds;
      try {
        data = Promise.await(
          FB.api(credential.serviceData.id, {
            fields: ["id", "name", "email"],
            access_token: credential.serviceData.accessToken,
          })
        );
        pagesIds = Promise.await(
          FB.api(credential.serviceData.id + "/ids_for_pages", {
            app: Meteor.settings.facebook.clientId,
            access_token: pageToken,
            appsecret_proof: secretProof.update(pageToken).digest("hex"),
          })
        );
      } catch (err) {
        console.log(err);
        throw new Meteor.Error(500, "Unexpected error, please try again.");
      }
      const facebookId = pagesIds.data.find(
        (pageId) => pageId.page.id == campaign.facebookAccount.facebookId
      ).id;
      if (data && facebookId) {
        People.upsert(
          { campaignId, facebookId },
          {
            $set: {
              campaignId,
              name: data.name,
              "campaignMeta.contact.email": data.email,
            },
            $setOnInsert: {
              source: "form",
            },
          }
        );
        const person = People.findOne({ campaignId, facebookId });
        let formId = person.formId;
        if (!formId) formId = PeopleHelpers.updateFormId({ person });
        return formId;
      }
    }
    throw new Meteor.Error(500, "Error fetching user data");
  },
});

export const peopleFormSubmit = new ValidatedMethod({
  name: "peopleForm.submit",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    formId: {
      type: String,
      optional: true,
    },
    facebookId: {
      type: String,
      optional: true,
    },
    recaptcha: {
      type: String,
      optional: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      optional: true,
    },
    twitter: {
      type: String,
      optional: true,
    },
    instagram: {
      type: String,
      optional: true,
    },
    cellphone: {
      type: String,
      optional: true,
    },
    birthday: {
      type: Date,
      optional: true,
    },
    address: {
      type: Object,
      optional: true,
    },
    "address.country": {
      type: String,
    },
    "address.zipcode": {
      type: String,
      optional: true,
    },
    "address.region": {
      type: String,
      optional: true,
    },
    "address.city": {
      type: String,
      optional: true,
    },
    "address.neighbourhood": {
      type: String,
      optional: true,
    },
    "address.street": {
      type: String,
      optional: true,
    },
    "address.number": {
      type: String,
      optional: true,
    },
    "address.complement": {
      type: String,
      optional: true,
    },
    skills: {
      type: Array,
      optional: true,
    },
    "skills.$": {
      type: String,
    },
    supporter: {
      type: Boolean,
      optional: true,
    },
    mobilizer: {
      type: Boolean,
      optional: true,
    },
    donor: {
      type: Boolean,
      optional: true,
    },
    volunteer: {
      type: Boolean,
      optional: true,
    },
  }).validator(),
  run(formData) {
    const { campaignId, formId, facebookId, recaptcha, ...data } = formData;
    logger.debug("peopleForm.submit called", { campaignId, formId });

    if (!data.email && !data.cellphone) {
      throw new Meteor.Error(400, "Email or phone is required");
    }

    let $set = {
      filledForm: true,
    };
    let $unset = {};

    for (const key in data) {
      switch (key) {
        case "email":
        case "cellphone":
          $set[`campaignMeta.contact.${key}`] = data[key];
          break;
        case "twitter":
        case "instagram":
          $set[`campaignMeta.social_networks.${key}`] = data[key];
          break;
        case "address":
        case "birthday":
        case "skills":
          $set[`campaignMeta.basic_info.${key}`] = data[key];
          break;
        case "supporter":
        case "mobilizer":
        case "donor":
        case "volunteer":
          $set[`campaignMeta.${key}`] = data[key];
        default:
          $set[key] = data[key];
      }
    }

    // if (!(formId || facebookId) && recaptchaSecret) {
    //   if (recaptcha) {
    //     const res = Promise.await(
    //       axios.request({
    //         url: "https://www.google.com/recaptcha/api/siteverify",
    //         headers: { "content-type": "application/x-www-form-urlencoded" },
    //         method: "post",
    //         params: {
    //           secret: recaptchaSecret,
    //           response: recaptcha,
    //         },
    //       })
    //     );
    //     if (!res.data.success) {
    //       throw new Meteor.Error(400, "Invalid recaptcha");
    //     }
    //   } else {
    //     throw new Meteor.Error(400, "Make sure you are not a robot");
    //   }
    // }

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

    let personId;
    let newPerson = true;

    if (formId || facebookId) {
      let selector = formId ? { formId } : { facebookId };
      const person = People.findOne(selector);
      if (!person) {
        throw new Meteor.Error(400, "Unauthorized request");
      }
      newPerson = false;
      People.update(selector, update);
      newFormId = PeopleHelpers.getFormId({
        personId: person._id,
        generate: true,
      });
      personId = person._id;
    } else {
      const id = Random.id();
      People.upsert(
        {
          campaignId,
          _id: id,
        },
        {
          ...update,
          $setOnInsert: {
            source: "form",
          },
        }
      );
      newFormId = PeopleHelpers.getFormId({
        personId: id,
        generate: true,
      });
      personId = id;
    }
    // ! Check for extra Duplicates
    PeopleHelpers.registerDuplicates({ personId });

    NotificationsHelpers.add({
      campaignId,
      category: newPerson ? "newFormUser" : "updateFormUser",
      metadata: {
        name: People.findOne(personId).name,
        personId,
      },
      path: `/people/${personId}`,
      dataRef: personId,
    });

    Meteor.call("log", {
      type: "people.formEntry",
      campaignId,
      data: { personId, newPerson },
    });
    return newFormId;
  },
});

export const peopleGetTags = new ValidatedMethod({
  name: "people.getTags",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    logger.debug("people.getTags called", { campaignId });
    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return PeopleTags.find({ campaignId }).fetch();
  },
});

export const peopleCreateTag = new ValidatedMethod({
  name: "people.createTag",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    name: {
      type: String,
    },
  }).validator(),
  run({ campaignId, name }) {
    logger.debug("peopleTags.create called", { campaignId });
    const userId = Meteor.userId();
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "categorize",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    const res = PeopleTags.insert({ campaignId, name });
    Meteor.call("log", {
      type: "people.tags.add",
      campaignId,
      data: { tagId: res },
    });
    return res;
  },
});

export const peopleListsCount = new ValidatedMethod({
  name: "peopleLists.peopleCount",
  validate: new SimpleSchema({
    listId: {
      type: String,
    },
  }).validator(),
  run({ listId }) {
    logger.debug("peopleLists.peopleCount called", { listId });
    const userId = Meteor.userId();
    const list = PeopleLists.findOne(listId);
    if (!list) {
      throw new Meteor.Error(404, "List not found");
    }
    const campaignId = list.campaignId;
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    return People.find({ listId }).count();
  },
});

export const peopleListsRemove = new ValidatedMethod({
  name: "peopleLists.remove",
  validate: new SimpleSchema({
    listId: {
      type: String,
    },
  }).validator(),
  run({ listId }) {
    logger.debug("peopleLists.peopleCount called", { listId });
    const userId = Meteor.userId();
    const list = PeopleLists.findOne(listId);
    if (!list) {
      throw new Meteor.Error(404, "List not found");
    }
    const campaignId = list.campaignId;
    if (
      !Meteor.call("campaigns.userCan", {
        campaignId,
        userId,
        feature: "people",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    People.remove({ listId });
    const res = PeopleLists.remove(listId);
    Meteor.call("log", {
      type: "people.imports.remove",
      campaignId,
      data: { listId },
    });
    return res;
  },
});
