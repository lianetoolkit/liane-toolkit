import SimpleSchema from "simpl-schema";
import moment from "moment";
import {
    People
} from "/imports/api/facebook/people/people.js";

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
        // Total people in people directory
        const rawPeople = People.rawCollection();
        const totalPeople = Promise.await(
            rawPeople.find({
                campaignId
            }).count()
        )
        // Total positive reactions(like, love and wow)
        // Total comments
        // Total people with canReceivePrivateReply

        return {
            totalPeople,
            positiveReactions: 122,
            comments: 1232,
            peoplePM: 876
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


