import SimpleSchema from "simpl-schema";
import axios from "axios";
import moment from "moment";
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

export const proposalsActivation = new ValidatedMethod({
  name: "chatbot.proposalsActivation",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    active: {
      type: Boolean
    }
  }).validator(),
  run({ campaignId, active }) {
    this.unblock();
    logger.debug("chatbot.proposalsActivation called", { campaignId, active });

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

    return ChatbotHelpers.proposalsActivation({ campaignId, active });
  }
});

export const getProposals = new ValidatedMethod({
  name: "chatbot.getProposals",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    }
  }).validator(),
  run({ campaignId }) {
    this.unblock();
    logger.debug("chatbot.getProposals called", { campaignId });

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

    return ChatbotHelpers.getProposals({ campaignId });
  }
});

export const upsertProposal = new ValidatedMethod({
  name: "chatbot.upsertProposal",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    proposal: {
      type: Object,
      blackbox: true
    }
  }).validator(),
  run({ campaignId, proposal }) {
    this.unblock();
    logger.debug("chatbot.upsertProposal called", { campaignId });

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

    return ChatbotHelpers.upsertProposal({ campaignId, proposal });
  }
});

export const removeProposal = new ValidatedMethod({
  name: "chatbot.removeProposal",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    proposalId: {
      type: Number
    }
  }).validator(),
  run({ campaignId, proposalId }) {
    this.unblock();
    logger.debug("chatbot.removeProposal called", { campaignId, proposalId });

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

    return ChatbotHelpers.removeProposal({ campaignId, proposalId });
  }
});

export const setPrimaryProposal = new ValidatedMethod({
  name: "chatbot.setPrimaryProposal",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    proposalId: {
      type: Number
    }
  }).validator(),
  run({ campaignId, proposalId }) {
    this.unblock();
    logger.debug("chatbot.removeProposal called", { campaignId, proposalId });

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

    return ChatbotHelpers.setPrimaryProposal({ campaignId, proposalId });
  }
});

export const sendNotification = new ValidatedMethod({
  name: "chatbot.sendNotification",
  validate: new SimpleSchema({
    campaignId: {
      type: String
    },
    message: {
      type: String
    }
  }).validator(),
  run({ campaignId, message }) {
    this.unblock();
    logger.debug("chatbot.sendNotification called", { campaignId });

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

    const lastDate = campaign.facebookAccount.chatbot.lastNotificationDate;

    if (
      lastDate &&
      moment(lastDate)
        .add(48, "hours")
        .isAfter(moment())
    ) {
      throw new Meteor.Error(400, "Rate limited");
    }

    const url = ChatbotHelpers.getYeekoUrl(
      campaign.facebookAccount.facebookId,
      "send_message"
    );

    let res;
    try {
      res = Promise.await(axios.post(url, { msg: message }));
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Unexpected error");
    }

    Campaigns.update(campaignId, {
      $set: {
        "facebookAccount.chatbot.lastNotificationDate": new Date()
      }
    });

    return true;
  }
});
