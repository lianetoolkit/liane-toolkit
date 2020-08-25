import SimpleSchema from "simpl-schema";
import moment from "moment";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { Comments } from "/imports/api/facebook/comments/comments.js";
import {
    People
} from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";

// import redisClient, { deleteByPattern } from "/imports/startup/server/redis";


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

        const campaign = Campaigns.findOne(campaignId);
        const facebookAccountId = campaign.facebookAccount.facebookId;


        //? TODO Define permission  feature
        if (
            !Meteor.call("campaigns.userCan", {
                campaignId,
                userId,
                feature: "dashboard",
                permission: "view",
            })
        ) {
            throw new Meteor.Error(401, "You are not allowed to do this action");
        }
        // 1 -  Total people in people directory
        const toCount = People.find({
            campaignId
        });
        const totalPeople = Promise.await(
            toCount.count()
        )
        // 2 - Total positive reactions(like, love and wow)
        let positiveReactions = 0;
        positiveReactions = Promise.await(Likes.find({
            facebookAccountId,
            "type": { "$in": ['LIKE', 'CARE', 'PRIDE', 'LOVE', 'WOW'] }
        }).count())

        // 3 - Total comments
        let comments = 0;
        comments = Promise.await(
            Comments.find({
                facebookAccountId
            }).count()
        )
        // 4 - Total people with canReceivePrivateReply
        const toPM = People.find({
            campaignId,
            receivedAutoPrivateReply: true
        });
        const peoplePM = Promise.await(
            toPM.count()
        )
        // redis update
        const result = {
            totalPeople,
            positiveReactions,
            comments,
            peoplePM
        };

        return result
        // return 
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

        logger.debug("dashboard.summary", { campaignId });
        const userId = Meteor.userId();

        //TODO Define permission feature
        if (
            !Meteor.call("campaigns.userCan", {
                campaignId,
                userId,
                feature: "dashboard",
                permission: "view",
            })
        ) {
            throw new Meteor.Error(401, "You are not allowed to do this action");
        }
        // Queries

        // return 
    },
});


