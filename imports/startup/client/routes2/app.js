import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";
import { pick } from "lodash";

import App from "/imports/ui2/containers/App.jsx";

import DashboardPage from "/imports/ui2/pages/Dashboard.jsx";
import PeoplePage from "/imports/ui2/pages/People.jsx";
import AuthPage from "/imports/ui2/pages/Auth.jsx";

import MapPage from "/imports/ui2/containers/MapPage.jsx";
import FAQPage from "/imports/ui2/containers/FAQPage.jsx";
import CommentsPage from "/imports/ui2/containers/CommentsPage.jsx";
import PeopleSinglePage from "/imports/ui2/containers/PeopleSinglePage.jsx";

import AdsetPage from "/imports/ui2/pages/Adset.jsx";

import ChatbotPage from "/imports/ui2/pages/chatbot/index.jsx";

import CampaignSettingsPage from "/imports/ui2/pages/campaign/settings/General.jsx";
import CampaignAccountsPage from "/imports/ui2/pages/campaign/settings/Accounts.jsx";
import CampaignActionsPage from "/imports/ui2/pages/campaign/settings/Actions.jsx";
import NewCampaignPage from "/imports/ui2/containers/campaign/New.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

// app routes
const appRoutes = FlowRouter.group({
  name: "app",
  triggersEnter: [trackRouteEntry]
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function() {
    addTitle(`${APP_NAME} | Dashboard`);
    return mount(App, { content: { component: DashboardPage } });
  }
});

appRoutes.route("/auth", {
  name: "App.auth",
  action: function() {
    addTitle(`${APP_NAME} | Authentication`);
    return mount(App, { content: { component: AuthPage } });
  }
});

appRoutes.route("/people", {
  name: "App.people",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | People`);
    return mount(App, {
      content: { component: PeoplePage },
      query: pick(queryParams, [
        "q",
        "category",
        "source",
        "tag",
        "form",
        "commented",
        "private_reply",
        "creation_from",
        "creation_to",
        "reaction_count",
        "reaction_type"
      ]),
      options: pick(queryParams, ["sort", "order"])
    });
  }
});

appRoutes.route("/people/:personId", {
  name: "App.people.detail",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | People`);
    return mount(App, {
      content: { component: PeopleSinglePage },
      personId: params.personId
    });
  }
});

appRoutes.route("/comments", {
  name: "App.comments",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Gestão de comentários`);
    return mount(App, {
      content: { component: CommentsPage },
      query: pick(queryParams, [
        "q",
        "resolved",
        "category",
        "mention",
        "unreplied",
        "hideReplies",
        "privateReply"
      ]),
      page: queryParams.page
    });
  }
});

appRoutes.route("/adset", {
  name: "App.adset",
  action: function() {
    addTitle(`${APP_NAME} | Criar adset`);
    return mount(App, {
      content: { component: AdsetPage }
    });
  }
});

appRoutes.route("/map", {
  name: "App.map",
  action: function() {
    addTitle(`${APP_NAME} | Território`);
    return mount(App, { content: { component: MapPage } });
  }
});

appRoutes.route("/faq", {
  name: "App.faq",
  action: function() {
    addTitle(`${APP_NAME} | Perguntas frequentes`);
    return mount(App, { content: { component: FAQPage } });
  }
});

appRoutes.route("/chatbot", {
  name: "App.chatbot",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Chatbot`);
    return mount(App, {
      content: { component: ChatbotPage },
      module: queryParams.module
    });
  }
});

appRoutes.route("/campaign/new", {
  name: "App.campaign.new",
  action: function() {
    addTitle(`${APP_NAME} | New Campaign`);
    return mount(App, {
      content: { component: NewCampaignPage }
    });
  }
});
appRoutes.route("/campaign/settings", {
  name: "App.campaign.settings",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Settings`);
    return mount(App, { content: { component: CampaignSettingsPage } });
  }
});
appRoutes.route("/campaign/settings/accounts", {
  name: "App.campaign.accounts",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Accounts`);
    return mount(App, { content: { component: CampaignAccountsPage } });
  }
});
appRoutes.route("/campaign/settings/actions", {
  name: "App.campaign.actions",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Actions`);
    return mount(App, { content: { component: CampaignActionsPage } });
  }
});
