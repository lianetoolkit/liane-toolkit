import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import App from "/imports/ui2/containers/App.jsx";

import DashboardPage from "/imports/ui2/pages/Dashboard.jsx";
import MapPage from "/imports/ui2/pages/Map.jsx";
import PeoplePage from "/imports/ui2/pages/People.jsx";
import ChatbotPage from "/imports/ui2/pages/Chatbot.jsx";
import AuthPage from "/imports/ui2/pages/Auth.jsx";

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
      query: queryParams
    });
  }
});

appRoutes.route("/map", {
  name: "App.map",
  action: function() {
    addTitle(`${APP_NAME} | Map`);
    return mount(App, { content: { component: MapPage } });
  }
});

appRoutes.route("/chatbot", {
  name: "App.chatbot",
  action: function() {
    addTitle(`${APP_NAME} | Chatbot`);
    return mount(App, { content: { component: ChatbotPage } });
  }
});

appRoutes.route("/campaign/new", {
  name: "App.campaign.new",
  action: function() {
    addTitle(`${APP_NAME} | New Campaign`);
    return mount(App, { content: { component: NewCampaignPage } });
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
