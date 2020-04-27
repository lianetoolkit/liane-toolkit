import SimpleSchema from "simpl-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";

import { Likes } from "/imports/api/facebook/likes/likes.js";
import { Entries } from "/imports/api/facebook/entries/entries.js";
import { People } from "/imports/api/facebook/people/people.js";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

export const likesByPerson = new ValidatedMethod({
  name: "likes.byPerson",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
    limit: {
      type: Number,
      optional: true,
    },
    skip: {
      type: Number,
      optional: true,
    },
  }).validator(),
  run({ personId, limit, skip }) {
    logger.debug("likes.byPerson called", { personId });

    const userId = Meteor.userId();
    const person = People.findOne(personId);

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId: person.campaignId,
        feature: "comments",
        permission: "view",
      })
    )
      throw new Meteor.Error(400, "Not allowed");

    if (!person.facebookId) return [];

    const options = {
      limit: Math.min(limit || 10, 20),
      skip: skip || 0,
    };

    let likes = Likes.find({ personId: person.facebookId }, options).fetch();

    likes = likes.map((like) => {
      like.entry = Entries.findOne(like.entryId);
      return like;
    });

    return likes;
  },
});

export const likesByPersonCount = new ValidatedMethod({
  name: "likes.byPerson.count",
  validate: new SimpleSchema({
    personId: {
      type: String,
    },
  }).validator(),
  run({ personId }) {
    logger.debug("likes.byPerson called", { personId });

    const userId = Meteor.userId();
    const person = People.findOne(personId);

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId: person.campaignId,
        feature: "comments",
        permission: "view",
      })
    )
      throw new Meteor.Error(400, "Not allowed");

    if (!person.facebookId) return 0;

    return Likes.find({ personId: person.facebookId }).count();
  },
});
