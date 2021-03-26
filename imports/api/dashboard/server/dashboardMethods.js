import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import redisClient from "/imports/startup/server/redis";
import { peopleHistory } from "../../facebook/people/server/peopleMethods";

const rawLikes = Likes.rawCollection();
rawLikes.distinctAsync = Meteor.wrapAsync(rawLikes.distinct);
const rawComments = Comments.rawCollection();
rawComments.distinctAsync = Meteor.wrapAsync(rawComments.distinct);

export const summaryData = new ValidatedMethod({
  name: "dashboard.summary",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    logger.debug("dashboard.summary", { campaignId });
    const userId = Meteor.userId();

    if (
      !userId ||
      !Meteor.call("campaigns.isUserTeam", {
        campaignId,
        userId,
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const campaign = Campaigns.findOne(campaignId);
    const facebookAccountId = campaign.facebookAccount.facebookId;
    const redisKey = `dashboard.${facebookAccountId}.dataSummary`;

    let dataSummary = redisClient.getSync(redisKey);

    if (!dataSummary) {
      // 1 -  Total people in people directory
      const totalPeople = People.find({
        campaignId,
      }).count();
      // 2 - Total positive reactions(like, love and wow)
      let positiveReactions = 0;
      positiveReactions = Likes.find({
        facebookAccountId,
        type: { $in: ["LIKE", "CARE", "PRIDE", "LOVE", "WOW", "THANKFUL"] },
      }).count();

      // 3 - Total comments
      let comments = 0;
      comments = Comments.find({
        facebookAccountId,
      }).count();
      // 4 - Total people with canReceivePrivateReply
      const peoplePM = People.find({
        campaignId,
        "canReceivePrivateReply.0": { $exists: true },
      }).count();

      // redis update
      dataSummary = JSON.stringify({
        totalPeople,
        positiveReactions,
        comments,
        peoplePM,
      });
      if (totalPeople > 0) {
        redisClient.setSync(
          redisKey,
          dataSummary,
          "EX",
          60 * 60 // 1 hour
        );
      }
    }

    return JSON.parse(dataSummary);
  },
});
export const achievements = new ValidatedMethod({
  name: "dashboard.achievements",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    logger.debug("dashboard.achievements", { campaignId });
    const userId = Meteor.userId();

    if (
      !userId ||
      !Meteor.call("campaigns.isUserTeam", {
        campaignId,
        userId,
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    const campaign = Campaigns.findOne(campaignId);
    const facebookAccountId = campaign.facebookAccount.facebookId;
    const redisKey = `dashboard.${facebookAccountId}.achievements`;

    let achievements = redisClient.getSync(redisKey);

    if (!achievements) {
      // 1  - Total forms filled
      const filledForms = People.find({
        campaignId,
        filledForm: true,
      }).count();
      // 2 - Total people with geolocation
      const geolocated = People.find({
        campaignId,
        location: { $exists: true },
      }).count();

      // 3 - Total comments replied by the page account
      let commentsReplies = Comments.find({
        facebookAccountId,
        personId: facebookAccountId,
        parentId: { $exists: true },
      }).count();

      achievements = JSON.stringify({
        filledForms,
        geolocated,
        commentsReplies,
      });
      if (filledForms > 0 || geolocated > 0 || commentsReplies > 0) {
        redisClient.setSync(
          redisKey,
          achievements,
          "EX",
          60 * 60 // 1 hour
        );
      }
    }
    // return
    return JSON.parse(achievements);
  },
});
export const funnelData = new ValidatedMethod({
  name: "dashboard.funnelData",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    logger.debug("dashboard.funnelData", { campaignId });
    const userId = Meteor.userId();

    if (
      !userId ||
      !Meteor.call("campaigns.isUserTeam", {
        campaignId,
        userId,
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    const campaign = Campaigns.findOne(campaignId);
    const facebookAccountId = campaign.facebookAccount.facebookId;
    const redisKey = `dashboard.${facebookAccountId}.funnelData`;

    let funnelData = redisClient.getSync(redisKey);

    if (!funnelData) {
      const totalPeople = People.find({
        campaignId,
      }).count();
      let positivePeople = 0;
      positivePeople = Promise.await(
        rawLikes.distinct("personId", {
          facebookAccountId,
          type: { $in: ["LIKE", "CARE", "PRIDE", "LOVE", "WOW", "THANKFUL"] },
        })
      ).length;

      const commentingPeople = Promise.await(
        rawComments.distinct("personId", {
          facebookAccountId,
        })
      ).length;

      const campaignFormPeople = People.find({
        campaignId,
        filledForm: true,
      }).count();

      funnelData = JSON.stringify({
        totalPeople,
        positivePeople,
        commentingPeople,
        campaignFormPeople,
      });
      if (totalPeople > 0) {
        redisClient.setSync(
          redisKey,
          funnelData,
          "EX",
          60 * 1 // 1 hour
        );
      }
    }
    // return
    return JSON.parse(funnelData);
  },
});

export const chartsData = new ValidatedMethod({
  name: "dashboard.chartsData",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    startDate: {
      type: String,
      optional: true,
    },
    endDate: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ campaignId, startDate, endDate }) {
    logger.debug("dashboard.chartsData", { campaignId });
    const userId = Meteor.userId();

    if (
      !userId ||
      !Meteor.call("campaigns.isUserTeam", {
        campaignId,
        userId,
      })
    ) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }
    const campaign = Campaigns.findOne(campaignId);
    const facebookAccountId = campaign.facebookAccount.facebookId;

    // Date setup
    const oneDay = 24 * 60 * 60 * 1000;
    let campaignStart = new Date(campaign.createdAt);
    campaignStart.setDate(campaignStart.getDate() + 1);

    let start = new Date(startDate || campaignStart);
    start = start < campaignStart ? campaignStart : start;

    let end = new Date(endDate ?? moment().subtract(1).format("YYYY-MM-DD"));
    const diffDays = Math.ceil(
      Math.abs((start.getTime() - end.getTime()) / oneDay)
    );

    if (diffDays < 6 && start == campaignStart) {
      return false;
    }

    if (diffDays > 90) {
      start = new Date(moment(end).subtract(90).format("YYYY-MM-DD"));
    }
    // counters for people and reactions

    let startHistory = new Date(JSON.parse(JSON.stringify(start)));
    let startInteraction = new Date(JSON.parse(JSON.stringify(start)));

    // Top Comments
    const commentersKey = `dashboard.${facebookAccountId}.${diffDays}days.topCommenters`;
    // let commentersData = null;
    let commentersData = redisClient.getSync(commentersKey);
    let topCommenters = null;
    if (!commentersData) {
      topCommenters = Promise.await(
        rawComments
          .aggregate([
            {
              $match: {
                created_time: {
                  $gte: start,
                  $lt: end,
                },
                personId: { $ne: facebookAccountId },
                facebookAccountId: facebookAccountId,
              },
            },
            {
              $group: {
                _id: "$personId",
                name: { $first: "$name" },
                counts: { $sum: 1 },
              },
            },
            {
              $project: {
                personId: "$_id",
                name: "$name",
                total: "$counts",
              },
            },
            { $sort: { total: -1 } },
            { $limit: 10 },
          ])
          .toArray()
      );

      for (const p of topCommenters) {
        const person = People.findOne({ facebookId: p.personId });
        if (person) p._id = person._id;
      }

      // return
      redisClient.setSync(
        commentersKey,
        JSON.stringify(topCommenters),
        "EX",
        60 * 60 * 12 // 12 hour
      );
    } else {
      topCommenters = JSON.parse(commentersData);
    }

    const reactionersKey = `dashboard.${facebookAccountId}.${diffDays}days.topReactioners`;
    let topReactioners = null;
    // let reactionersData = null;
    let reactionersData = redisClient.getSync(reactionersKey);
    // Top Reactions
    if (!reactionersData) {
      topReactioners = Promise.await(
        rawLikes
          .aggregate([
            {
              $match: {
                // Reactions are in unix timestamp
                created_time: {
                  $gte: start.getTime(),
                  $lt: end.getTime(),
                },
                personId: { $ne: facebookAccountId },
                facebookAccountId: facebookAccountId,
              },
            },
            {
              $group: {
                _id: "$personId",
                name: { $first: "$name" },
                counts: { $sum: 1 },
              },
            },
            {
              $project: {
                personId: "$_id",
                name: "$name",
                total: "$counts",
              },
            },
            { $sort: { total: -1 } },
            { $limit: 10 },
          ])
          .toArray()
      );

      for (const p of topReactioners) {
        const person = People.findOne({ facebookId: p.personId });
        if (person) p._id = person._id;
      }
      redisClient.setSync(
        reactionersKey,
        JSON.stringify(topReactioners),
        "EX",
        60 * 60 * 12 // 12 hour
      );
    } else {
      topReactioners = JSON.parse(reactionersData);
    }

    // Charts
    const redisChartsKey = `dashboard.${facebookAccountId}.${diffDays}days.chartData`;

    // let chartsData = false;
    let chartsData = redisClient.getSync(redisChartsKey);

    let peopleHistory = {};
    let interactionHistory = {};

    if (!chartsData) {
      // 3 Data Incoming from Facebook by date

      for (let d = startHistory; d <= end; d.setDate(d.getDate() + 1)) {
        const formattedDate = moment(d).format("YYYY-MM-DD");
        if (!peopleHistory.hasOwnProperty(formattedDate)) {
          peopleHistory[formattedDate] = People.find({
            campaignId,
            source: { $in: ["facebook", "instagram"] },
            imported: { $ne: true },
            createdAt: {
              $gte: moment(formattedDate).toDate(),
              $lte: moment(formattedDate).add(1, "day").toDate(),
            },
          }).count();
        }
      }
      // Clean
      const peopleKeys = Object.keys(peopleHistory);
      if (peopleKeys.length > 90) {
        peopleKeys.forEach((key) => {
          let d = new Date(key);
          if (d.getTime() < start || d.getTime() > end) {
            delete peopleHistory[key];
          }
        });
      }

      // 4 Reactions + Comments on Facebook by Date

      for (let i = startInteraction; i <= end; i.setDate(i.getDate() + 1)) {
        const formattedDate = moment(i).format("YYYY-MM-DD");
        if (!interactionHistory.hasOwnProperty(formattedDate)) {
          interactionHistory[formattedDate] = {};
          // Comments
          interactionHistory[formattedDate]["comments"] = Comments.find({
            facebookAccountId,
            created_time: {
              $gte: moment(formattedDate).toDate(),
              $lt: moment(formattedDate).add(1, "day").toDate(),
            },
          }).count();

          // Reactions
          interactionHistory[formattedDate]["reactions"] = { total: 0 };
          const reactions = Likes.find({
            facebookAccountId,
            created_time: {
              $gte: moment(formattedDate).valueOf(),
              $lt: moment(formattedDate).add(1, "day").valueOf(),
            },
          });

          interactionHistory[formattedDate][
            "reactions"
          ].total = reactions.count();
          reactions.map((e) => {
            interactionHistory[formattedDate]["reactions"][e.type]
              ? interactionHistory[formattedDate]["reactions"][e.type]++
              : (interactionHistory[formattedDate]["reactions"][e.type] = 1);
          });
        }
      }

      const reactionKeys = Object.keys(interactionHistory);
      if (reactionKeys.length > 90) {
        reactionKeys.forEach((key) => {
          let d = new Date(key);
          if (d.getTime() < start || d.getTime() > end) {
            delete interactionHistory[key];
          }
        });
      }

      redisClient.setSync(
        redisChartsKey,
        JSON.stringify({
          peopleHistory,
          interactionHistory,
        }),
        "EX",
        60 * 60 * 12 // 12 hour
      );
    } else {
      chartsData = JSON.parse(chartsData);
      peopleHistory = chartsData.peopleHistory;
      interactionHistory = chartsData.interactionHistory;
    }

    chartsData = {
      topReactioners,
      topCommenters,
      peopleHistory,
      interactionHistory,
    };

    return chartsData;
  },
});
