import SimpleSchema from "simpl-schema";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { ChatbotHelpers } from "./chatbotHelpers.js";
import { ValidatedMethod } from "meteor/mdg:validated-method";

export const chatbotActivation = new ValidatedMethod({
  name: "chatbot.activation",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    active: {
      type: Boolean,
      defaultValue: false,
      optional: true
    }
  }).validator(),
  run({ campaignId, active }) {
    this.unblock();
    logger.debug("chatbot.activate called", {
      campaignId,
      active
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    if (active) {
      return ChatbotHelpers.activateChatbot({ campaignId });
    } else {
      return ChatbotHelpers.deactivateChatbot({ campaignId });
    }
  }
});

export const chatbotTestMode = new ValidatedMethod({
  name: "chatbot.testMode",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    test: {
      type: Boolean,
      defaultValue: true,
      optional: true
    }
  }).validator(),
  run({ campaignId, test }) {
    this.unblock();
    logger.debug("chatbot.activate called", {
      campaignId,
      test
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return ChatbotHelpers.testMode({ campaignId, test });
  }
});

export const removeChatbot = new ValidatedMethod({
  name: "chatbot.remove",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("chatbot.remove called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return ChatbotHelpers.removeChatbot({ campaignId });
  }
});

export const getChatbot = new ValidatedMethod({
  name: "chatbot.get",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("chatbot.get called", { campaignId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    const chatbot = ChatbotHelpers.getChatbot({ campaignId });

    return chatbot.data;
  }
});

export const campaignsUpdateChatbot = new ValidatedMethod({
  name: "chatbot.update",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    config: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, facebookAccountId, config }) {
    this.unblock();
    logger.debug("chatbot.update called", {
      campaignId,
      facebookAccountId
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return ChatbotHelpers.updateChatbot({
      campaignId,
      config
    });
  }
});

export const chatbotModuleActivation = new ValidatedMethod({
  name: "chatbot.moduleActivation",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    module: {
      type: String
    },
    active: {
      type: Boolean
    }
  }).validator(),
  run({ campaignId, module, active }) {
    this.unblock();
    logger.debug("chatbot.moduleActivation called", {
      campaignId,
      module,
      active
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const campaign = Campaigns.findOne(campaignId);
    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    const allowed = Meteor.call("campaigns.canManage", { userId, campaignId });

    if (!allowed) {
      throw new Meteor.Error(401, "You are not allowed to do this action");
    }

    return ChatbotHelpers.chatbotModuleActivation({
      campaignId,
      module,
      active
    });
  }
});
