import { Promise } from "meteor/promise";
import axios from "axios";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { set } from "lodash";

const YEEKO = Meteor.settings.yeeko;

const ChatbotHelpers = {
  getChatbotDefaultConfig({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    const account = FacebookAccounts.findOne({
      facebookId: campaignAccount.facebookId
    });

    return {
      idPage: account.facebookId,
      tokenPage: campaignAccount.accessToken,
      title: account.name,
      fanPage: `https://facebook.com/${account.facebookId}`,
      description: "test",
      menu_autoconfigurable: true,
      menu_principal: true
    };
  },
  parseYeeko(data) {
    let result = {};
    for (const key in data) {
      let item;
      switch (key) {
        case "extra_info":
          item = JSON.parse(data[key]);
          break;
        default:
          item = data[key];
      }
      result[key] = item;
    }
    return result;
  },
  unparseYeeko(data) {
    let result = {};
    for (const key in data) {
      let item;
      switch (key) {
        case "extra_info":
          item = JSON.stringify(data[key]);
          break;
        default:
          item = data[key];
      }
      result[key] = item;
    }
    return result;
  },
  getChatbot({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    if (!campaign.facebookAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }
    let res;
    try {
      res = Promise.await(
        axios.get(
          `${YEEKO.url}${campaign.facebookAccount.facebookId}?api_key=${
            YEEKO.apiKey
          }`
        )
      );
    } catch (err) {
      console.log(err);
    }
    if (res && res.data) {
      const parsed = this.parseYeeko(res.data);
      if (
        !campaign.facebookAccount.chatbot ||
        JSON.stringify(parsed) !=
          JSON.stringify(campaign.facebookAccount.chatbot)
      ) {
        Campaigns.update(
          { _id: campaign._id },
          { $set: { "facebookAccount.chatbot": parsed } }
        );
      }
      return {
        source: "yeeko",
        data: parsed
      };
    } else {
      if (
        campaign.facebookAccount.chatbot &&
        campaign.facebookAccount.chatbot.active
      ) {
        Campaigns.update(campaign._id, {
          $set: { "facebookAccount.chatbot.active": false }
        });
      }
      return {
        source: "local",
        data: campaign.facebookAccount.chatbot
      };
    }
  },
  activateChatbot({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook account not found");
    }

    const chatbot = this.getChatbot({ campaignId });
    const config = {
      ...this.getChatbotDefaultConfig({ campaignId }),
      ...(chatbot.data || {})
    };

    let res;
    if (chatbot.source == "local") {
      try {
        res = Promise.await(
          axios.post(`${YEEKO.url}?api_key=${YEEKO.apiKey}`, {
            ...this.unparseYeeko(config),
            active: true
          })
        );
      } catch (err) {
        console.log(err);
        throw new Meteor.Error(
          500,
          "Error creating configuration with Yeeko api"
        );
      }
    } else if (chatbot.source == "yeeko") {
      try {
        res = Promise.await(
          axios.put(
            `${YEEKO.url}${campaignAccount.facebookId}?api_key=${YEEKO.apiKey}`,
            {
              // ...this.unparseYeeko(config),
              active: true
            }
          )
        );
      } catch (err) {
        console.log(err);
        throw new Meteor.Error(500, "Error updating to Yeeko api");
      }
    }

    const parsed = this.parseYeeko(res.data);

    // Update locally
    Campaigns.update(
      { _id: campaignId },
      {
        $set: {
          "facebookAccount.chatbot": parsed
        }
      }
    );

    return parsed;
  },
  updateChatbot({ campaignId, config }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    if (!campaignAccount.chatbot || !campaignAccount.chatbot.active) {
      throw new Meteor.Error(401, "Chatbot is not active");
    }

    // Yeeko
    const defaultConfig = this.getChatbotDefaultConfig({ campaignId });
    let res;
    try {
      res = Promise.await(
        axios.put(
          `${YEEKO.url}${campaignAccount.facebookId}/?api_key=${YEEKO.apiKey}`,
          {
            ...this.unparseYeeko(defaultConfig),
            ...this.unparseYeeko(config)
          }
        )
      );
    } catch (err) {
      console.log(err.response.data);
      throw new Meteor.Error(500, "Error connecting to Yeeko api");
    }

    const parsed = this.parseYeeko(res.data);

    Campaigns.update(
      {
        _id: campaignId
      },
      {
        $set: {
          "facebookAccount.chatbot": parsed
        }
      }
    );

    return parsed;
  },
  chatbotModuleActivation({ campaignId, module, active }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    if (!campaignAccount.chatbot || !campaignAccount.chatbot.active) {
      throw new Meteor.Error(401, "Chatbot is not active");
    }

    let chatbot = this.getChatbot({ campaignId }).data;

    set(chatbot, `extra_info.${module}.active`, active);

    let res;
    try {
      res = Promise.await(
        axios.put(
          `${YEEKO.url}${campaignAccount.facebookId}/?api_key=${YEEKO.apiKey}`,
          this.unparseYeeko(chatbot)
        )
      );
    } catch (err) {
      console.log(err.response.data);
      throw new Meteor.Error(500, "Error connecting to Yeeko api");
    }

    const parsed = this.parseYeeko(res.data);

    Campaigns.update(
      {
        _id: campaignId
      },
      {
        $set: {
          "facebookAccount.chatbot": parsed
        }
      }
    );

    return parsed;
  },
  deactivateChatbot({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    const config = this.unparseYeeko(this.getChatbot({ campaignId }).data);

    let res;
    try {
      res = Promise.await(
        axios.put(
          `${YEEKO.url}${campaignAccount.facebookId}/?api_key=${YEEKO.apiKey}`,
          {
            ...config,
            active: false
          }
        )
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error connecting to Yeeko api");
    }

    return Campaigns.update(
      {
        _id: campaignId
      },
      {
        $set: {
          "facebookAccount.chatbot": this.parseYeeko(res.data)
        }
      }
    );
  },
  removeChatbot({ campaignId }) {
    const campaign = Campaigns.findOne(campaignId);
    const campaignAccount = campaign.facebookAccount;

    if (!campaign) {
      throw new Meteor.Error(404, "Campaign not found");
    }

    if (!campaignAccount) {
      throw new Meteor.Error(404, "Facebook Account not found");
    }

    try {
      const yeekoRes = Promise.await(
        axios.delete(
          `${YEEKO.url}${campaignAccount.facebookId}/?api_key=${YEEKO.apiKey}`
        )
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error connecting to Yeeko api");
    }

    return Campaigns.update(
      { _id: campaignId },
      {
        $set: {
          "facebookAccount.chatbot.active": false
        }
      }
    );
  }
};

exports.ChatbotHelpers = ChatbotHelpers;
