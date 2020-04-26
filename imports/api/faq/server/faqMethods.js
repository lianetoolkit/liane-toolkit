import SimpleSchema from "simpl-schema";
import { FAQ } from "../faq";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";

export const queryFAQ = new ValidatedMethod({
  name: "faq.query",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("faq.query called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "faq",
        permission: "view",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    return FAQ.find({ campaignId }, { sort: { lastUsedAt: -1 } }).fetch();
  },
});

export const createFAQ = new ValidatedMethod({
  name: "faq.create",
  validate: new SimpleSchema({
    campaignId: {
      type: String,
    },
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
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

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "faq",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    const res = FAQ.insert({ campaignId, question, answer });

    Meteor.call("log", {
      type: "faq.add",
      campaignId,
      data: { faqId: res },
    });

    return res;
  },
});

export const updateLastUsed = new ValidatedMethod({
  name: "faq.updateLastUsed",
  validate: new SimpleSchema({
    faqId: {
      type: String,
    },
  }).validator(),
  run({ faqId }) {
    const userId = Meteor.userId();
    const item = FAQ.findOne(faqId);
    const campaignId = item.campaignId;
    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "comments",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }
    FAQ.update(faqId, { $set: { lastUsedAt: new Date() } });
  },
});

export const updateFAQ = new ValidatedMethod({
  name: "faq.update",
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
    question: {
      type: String,
    },
    answer: {
      type: String,
    },
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

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "faq",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    const res = FAQ.update(_id, { $set: { question, answer } });

    Meteor.call("log", {
      type: "faq.edit",
      campaignId,
      data: { faqId: _id },
    });

    return res;
  },
});

export const removeFAQ = new ValidatedMethod({
  name: "faq.remove",
  validate: new SimpleSchema({
    _id: {
      type: String,
    },
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

    if (
      !Meteor.call("campaigns.userCan", {
        userId,
        campaignId,
        feature: "faq",
        permission: "edit",
      })
    ) {
      throw new Meteor.Error(401, "Not allowed");
    }

    const res = FAQ.remove(_id);

    Meteor.call("log", {
      type: "faq.remove",
      campaignId,
      data: { faqId: _id },
    });

    return res;
  },
});
