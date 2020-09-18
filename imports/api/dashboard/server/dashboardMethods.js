import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import {
    People
} from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";
import redisClient from "/imports/startup/server/redis";

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
                campaignId
            }).count()
            // 2 - Total positive reactions(like, love and wow)
            let positiveReactions = 0;
            positiveReactions = Likes.find({
                facebookAccountId,
                "type": { "$in": ['LIKE', 'CARE', 'PRIDE', 'LOVE', 'WOW', 'THANKFUL'] }
            }).count()

            // 3 - Total comments
            let comments = 0;
            comments = Comments.find({
                facebookAccountId
            }).count()
            // 4 - Total people with canReceivePrivateReply
            const peoplePM = People.find({
                campaignId,
                receivedAutoPrivateReply: true
            }).count();

            // redis update
            dataSummary = JSON.stringify({
                totalPeople,
                positiveReactions,
                comments,
                peoplePM
            });
            redisClient.setSync(
                redisKey,
                dataSummary,
                "EX",
                60 * 60 // 1 hour
            );
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
                filledForm: true
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

            achievements = JSON.stringify({ filledForms, geolocated, commentsReplies });
            redisClient.setSync(
                redisKey,
                achievements,
                "EX",
                60 * 60 // 1 hour
            );
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
                campaignId
            }).count();
            let positivePeople = 0;
            positivePeople = Promise.await(rawLikes.distinct('personId', {
                facebookAccountId,
                "type": { "$in": ['LIKE', 'CARE', 'PRIDE', 'LOVE', 'WOW', 'THANKFUL'] }
            })).length

            const commetingPeople = Promise.await(rawComments.distinct('personId', {
                facebookAccountId,
            })).length;

            const campaignFormPeople = People.find({
                campaignId,
                filledForm: true
            }).count();;

            funnelData = JSON.stringify({ totalPeople, positivePeople, commetingPeople, campaignFormPeople });
            redisClient.setSync(
                redisKey,
                funnelData,
                "EX",
                60 * 1 // 1 hour
            );
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
    }).validator(),
    run({ campaignId }) {

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
        const redisKey = `dashboard.${facebookAccountId}.chartsData`;

        let chartsData = redisClient.getSync(redisKey);

        if (!chartsData) {

            const oneDay = 24 * 60 * 60 * 1000;
            let fromDatePeople = new Date(campaign.createdAt);
            let fromDateReactions = new Date(campaign.createdAt);
            fromDatePeople.setDate(fromDatePeople.getDate() + 1);
            fromDateReactions.setDate(fromDateReactions.getDate() + 1);

            let toDate = new Date();
            toDate.setDate(toDate.getDate() - 1);

            const diffDays = Math.ceil(
                Math.abs((fromDatePeople.getTime() - toDate.getTime()) / oneDay)
            );
            if (diffDays <= 4) {
                return { total, history };
            }
            //? Do we add a fixed amount of days or we give start and end as params?
            // if (diffDays > 14) {
            //     fromDate = new Date();
            //     fromDate.setDate(fromDate.getDate() - 15);
            // }

            // 1 Top reactioners 
            let topReactioners = Promise.await(
                rawLikes
                    .aggregate([
                        {
                            $match: {
                                facebookAccountId: facebookAccountId,
                            }
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
                                name: "$name",
                                total: "$counts",
                            },
                        },
                        { $sort: { total: -1 } }
                    ])
                    .toArray()
            );
            topReactioners = topReactioners.filter(e => e._id !== facebookAccountId)

            // 2 Top Commentes 

            let topCommenters = Promise.await(
                rawComments
                    .aggregate([
                        {
                            $match: {
                                facebookAccountId: facebookAccountId,
                            }
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
                                name: "$name",
                                total: "$counts",
                            },
                        },
                        { $sort: { total: -1 } }
                    ])
                    .toArray()
            );
            topCommenters = topCommenters.filter(e => e._id !== facebookAccountId)

            // 3 Data Incoming from Facebook by date

            let peopleHistory = {};
            let total = 0;

            for (let d = fromDatePeople; d <= toDate; d.setDate(d.getDate() + 1)) {
                const formattedDate = moment(d).format("YYYY-MM-DD");
                if (!peopleHistory.hasOwnProperty(formattedDate)) {
                    peopleHistory[formattedDate] = People.find({
                        campaignId,
                        source: "facebook",
                        createdAt: {
                            $gte: moment(formattedDate).toDate(),
                            $lte: moment(formattedDate).add(1, "day").toDate(),
                        },
                    }).count();
                }
            }

            ;        // 4 Reactions + Comments on Facebook by Date
            let interactionHistory = {};
            console.log('interactionHistory >> ', fromDateReactions, toDate)
            for (let i = fromDateReactions; i <= toDate; i.setDate(i.getDate() + 1)) {

                const formattedDate = moment(i).format("YYYY-MM-DD");
                if (!interactionHistory.hasOwnProperty(formattedDate)) {
                    interactionHistory[formattedDate] = {};
                    // Comments
                    interactionHistory[formattedDate]['comments'] = Comments.find({
                        facebookAccountId,
                        createdAt: {
                            $gte: moment(formattedDate).toDate(),
                            $lte: moment(formattedDate).add(1, "day").toDate(),
                        },
                    }).count();

                    // Reactions
                    interactionHistory[formattedDate]['reactions'] = { total: 0 }
                    const reactions = Likes.find({
                        facebookAccountId,
                        createdAt: {
                            $gte: moment(formattedDate).toDate(),
                            $lte: moment(formattedDate).add(1, "day").toDate(),
                        },
                    });

                    interactionHistory[formattedDate]['reactions'].total = reactions.count()
                    reactions.map(e => {
                        interactionHistory[formattedDate]['reactions'][e.type] ? interactionHistory[formattedDate]['reactions'][e.type]++ : interactionHistory[formattedDate]['reactions'][e.type] = 1
                    })
                }
            }
            chartsData = {
                topReactioners,
                topCommenters,
                peopleHistory,
                interactionHistory
            }
        }
        return chartsData;
    },
});



