import SimpleSchema from "simpl-schema";
import { FAQ } from "../faq";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

export const createFAQ = new ValidatedMethod({
  name: "faq.create",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    question: {
      type: String
    },
    answer: {
      type: String
    }
  }).validator(),
  run({ campaignId, question, answer }) {
    this.unblock();
    logger.debug("faq.create called", { campaignId, question });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "Not allowed");
    }

    return FAQ.insert({ campaignId, question, answer });
  }
});

export const updateFAQ = new ValidatedMethod({
  name: "faq.update",
  validate: new SimpleSchema({
    _id: {
      type: String
    },
    question: {
      type: String
    },
    answer: {
      type: String
    }
  }).validator(),
  run({ _id, question, answer }) {
    this.unblock();
    logger.debug("faq.update called", { _id });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const item = FAQ.findOne(_id);
    const campaignId = item.campaignId;

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "Not allowed");
    }

    return FAQ.update(_id, { $set: { question, answer } });
  }
});

export const removeFAQ = new ValidatedMethod({
  name: "faq.remove",
  validate: new SimpleSchema({
    _id: {
      type: String
    }
  }).validator(),
  run({ _id }) {
    this.unblock();
    logger.debug("faq.remove called", { _id });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const item = FAQ.findOne(_id);
    const campaignId = item.campaignId;

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!Meteor.call("campaigns.canManage", { userId, campaignId })) {
      throw new Meteor.Error(401, "Not allowed");
    }

    return FAQ.remove(_id);
  }
});
