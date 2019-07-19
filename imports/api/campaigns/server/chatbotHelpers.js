import { Promise } from "meteor/promise";
import axios from "axios";
import { Campaigns } from "/imports/api/campaigns/campaigns.js";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { set } from "lodash";

const YEEKO = Meteor.settings.yeeko;

const getYeekoUrl = (facebookId, path = "") => {
  let url = YEEKO.url;
  if (facebookId) {
    url += facebookId + "/";
  }
  url += path;
  url += `?api_key=${YEEKO.apiKey}`;
  return url;
};

const ChatbotHelpers = {
  chatbotObject({ campaignId }) {
    return Campaigns.findOne(campaignId).facebookAccount.chatbot;
  },
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
          if (data[key]) {
            item = JSON.parse(data[key]);
          } else {
            item = {};
          }
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
        axios.get(getYeekoUrl(campaign.facebookAccount.facebookId))
      );
    } catch (err) {
      if (!err.response || err.response.status != 404) {
        throw new Meteor.Error(500, "Unexpected error");
        console.log(err);
      }
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
          { $set: { "facebookAccount.chatbot.config": parsed } }
        );
      }
      return {
        source: "yeeko",
        data: this.chatbotObject({ campaignId })
      };
    } else {
      if (
        campaign.facebookAccount.chatbot &&
        campaign.facebookAccount.chatbot.active
      ) {
        Campaigns.update(campaign._id, {
          $set: { "facebookAccount.chatbot.config.active": false }
        });
      }
      return {
        source: "local",
        data: this.chatbotObject({ campaignId })
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
          axios.post(getYeekoUrl(), {
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
          axios.put(getYeekoUrl(campaign.facebookAccount.facebookId), {
            // ...this.unparseYeeko(config),
            active: true
          })
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
          "facebookAccount.chatbot.config": parsed
        }
      }
    );

    return this.chatbotObject({ campaignId });
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
        axios.put(getYeekoUrl(campaignAccount.facebookId), {
          ...this.unparseYeeko(defaultConfig),
          ...this.unparseYeeko(config)
        })
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
          "facebookAccount.chatbot.config": parsed
        }
      }
    );

    return this.chatbotObject({ campaignId });
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
          getYeekoUrl(campaignAccount.facebookId),
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
          "facebookAccount.chatbot.config": parsed
        }
      }
    );

    return this.chatbotObject({ campaignId });
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
        axios.put(getYeekoUrl(campaignAccount.facebookId), {
          ...config,
          active: false
        })
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
          "facebookAccount.chatbot.config": this.parseYeeko(res.data)
        }
      }
    );
  },
  testMode({ campaignId, test }) {
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
        axios.put(getYeekoUrl(campaignAccount.facebookId), {
          ...config,
          test
        })
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
          "facebookAccount.chatbot.config": this.parseYeeko(res.data)
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
        axios.delete(getYeekoUrl(campaignAccount.facebookId))
      );
    } catch (err) {
      console.log(err);
      throw new Meteor.Error(500, "Error connecting to Yeeko api");
    }

    return Campaigns.update(
      { _id: campaignId },
      {
        $set: {
          "facebookAccount.chatbot.config": {}
        }
      }
    );
  }
};

exports.ChatbotHelpers = ChatbotHelpers;
