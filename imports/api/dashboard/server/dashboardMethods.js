import SimpleSchema from "simpl-schema";
import moment from "moment";
import {
    People
} from "/imports/api/facebook/people/people.js";
import { Likes } from "/imports/api/facebook/likes/likes.js";

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

        //TODO Define permission  feature
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
        const rawPeople = People.rawCollection();

        // 1 -  Total people in people directory

        const toCount = rawPeople.find({
            campaignId
        });

        const totalPeople = Promise.await(
            toCount.count()
        )
        // 2 - Total positive reactions(like, love and wow)
        // 3 - Total comments
        let comments = 0
        let positiveReactions = 0
        toCount.forEach(person => {
            if (person.counts) {
                if (person.counts.comments) comments += person.counts.comments;
                if (person.counts.likes) positiveReactions += person.counts.likes;
            }
        })


        // 4 - Total people with canReceivePrivateReply
        const toPM = rawPeople.find({
            campaignId,
            receivedAutoPrivateReply: true
        });
        const peoplePM = Promise.await(
            toPM.count()
        )

        return {
            totalPeople,
            positiveReactions,
            comments,
            peoplePM
        }
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


