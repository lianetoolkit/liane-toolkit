import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import DashboardPage from "/imports/ui2/pages/Dashboard.jsx";
import MapPage from "/imports/ui2/pages/Map.jsx";

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

appRoutes.route("/map", {
  name: "App.map",
  action: function() {
    addTitle(`${APP_NAME} | Map`);
    return mount(MapPage);
  }
});
