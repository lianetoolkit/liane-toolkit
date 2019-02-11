import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import DashboardPage from "/imports/ui2/pages/Dashboard.jsx";
import MapPage from "/imports/ui2/pages/Map.jsx";
import PeoplePage from "/imports/ui2/pages/People.jsx";
import AuthPage from "/imports/ui2/pages/Auth.jsx";

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
    return mount(DashboardPage);
  }
});

appRoutes.route("/auth", {
  name: "App.auth",
  action: function() {
    addTitle(`${APP_NAME} | Authentication`);
    return mount(AuthPage);
  }
});

appRoutes.route("/people", {
  name: "App.people",
  action: function() {
    addTitle(`${APP_NAME} | People`);
    return mount(PeoplePage);
  }
});

appRoutes.route("/map", {
  name: "App.map",
  action: function() {
    addTitle(`${APP_NAME} | Map`);
    return mount(MapPage);
  }
});
