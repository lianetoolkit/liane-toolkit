import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import AppContainer from "/imports/ui/containers/app/AppContainer.jsx";

import JobsPage from "/imports/ui/pages/jobs/JobsPage.jsx";

import CampaignsContainer from "/imports/ui/containers/admin/CampaignsContainer.jsx";

import ContextsPageContainer from "/imports/ui/containers/contexts/ContextsPageContainer.jsx";

import EditContextsPageContainer from "/imports/ui/containers/contexts/EditContextsPageContainer.jsx";

import AudienceCategoriesPageContainer from "/imports/ui/containers/audiences/AudienceCategoriesPageContainer.jsx";
import EditAudienceCategoriesPageContainer from "/imports/ui/containers/audiences/EditAudienceCategoriesPageContainer.jsx";

import GeolocationsPageContainer from "/imports/ui/containers/geolocations/GeolocationsPageContainer.jsx";
import EditGeolocationsPageContainer from "/imports/ui/containers/geolocations/EditGeolocationsPageContainer.jsx";

import MapLayersContainer from "/imports/ui/containers/mapLayers/MapLayersContainer.jsx";
import EditMapLayersContainer from "/imports/ui/containers/mapLayers/EditMapLayersContainer.jsx";

import UsersContainer from "/imports/ui/containers/users/UsersContainer.jsx";
import EditUsersContainer from "/imports/ui/containers/users/EditUsersContainer.jsx";

import OptionsContainer from "/imports/ui/containers/admin/OptionsContainer.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

// app routes
const adminRoutes = FlowRouter.group({
  name: "app",
  prefix: "/admin",
  triggersEnter: [trackRouteEntry]
});

adminRoutes.route("/jobs", {
  name: "App.admin.jobs",
  action: function() {
    addTitle(`${APP_NAME} | Jobs`);
    return mount(AppContainer, {
      content: { component: JobsPage }
    });
  }
});

adminRoutes.route("/contexts", {
  name: "App.admin.contexts",
  action: function() {
    addTitle(`${APP_NAME} | Contexts`);
    return mount(AppContainer, {
      content: { component: ContextsPageContainer }
    });
  }
});

adminRoutes.route("/contexts/edit/:contextId?", {
  name: "App.admin.contexts.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Contexts`);
    return mount(AppContainer, {
      content: {
        component: EditContextsPageContainer,
        props: { contextId: params.contextId }
      }
    });
  }
});

adminRoutes.route("/audience-categories", {
  name: "App.admin.audienceCategories",
  action: function() {
    addTitle(`${APP_NAME} | Audience Categories`);
    return mount(AppContainer, {
      content: { component: AudienceCategoriesPageContainer }
    });
  }
});

adminRoutes.route("/audience-categories/edit/:audienceCategoryId?", {
  name: "App.admin.audienceCategories.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Audience Categories`);
    return mount(AppContainer, {
      content: {
        component: EditAudienceCategoriesPageContainer,
        props: { audienceCategoryId: params.audienceCategoryId }
      }
    });
  }
});

adminRoutes.route("/campaigns", {
  name: "App.admin.campaigns",
  action: function() {
    addTitle(`${APP_NAME} | Campaigns`);
    return mount(AppContainer, {
      content: {
        component: CampaignsContainer
      }
    });
  }
});

adminRoutes.route("/geolocations", {
  name: "App.admin.geolocations",
  action: function() {
    addTitle(`${APP_NAME} | Geolocations`);
    return mount(AppContainer, {
      content: {
        component: GeolocationsPageContainer
      }
    });
  }
});

adminRoutes.route("/geolocations/edit/:geolocationId?", {
  name: "App.admin.geolocations.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Geolocations`);
    return mount(AppContainer, {
      content: {
        component: EditGeolocationsPageContainer,
        props: { geolocationId: params.geolocationId }
      }
    });
  }
});

adminRoutes.route("/layers", {
  name: "App.admin.mapLayers",
  action: function() {
    addTitle(`${APP_NAME} | Map Layers`);
    return mount(AppContainer, {
      content: {
        component: MapLayersContainer
      }
    });
  }
});

adminRoutes.route("/layers/edit/:mapLayerId?", {
  name: "App.admin.mapLayers.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Map Layers`);
    return mount(AppContainer, {
      content: {
        component: EditMapLayersContainer,
        props: { mapLayerId: params.mapLayerId }
      }
    });
  }
});

adminRoutes.route("/users", {
  name: "App.admin.users",
  action: function() {
    addTitle(`${APP_NAME} | Users`);
    return mount(AppContainer, {
      content: {
        component: UsersContainer
      }
    });
  }
});

adminRoutes.route("/users/edit/:userId?", {
  name: "App.admin.users.edit",
  action: function(params) {
    addTitle(`${APP_NAME} | Users`);
    return mount(AppContainer, {
      content: {
        component: EditUsersContainer,
        props: { userId: params.userId }
      }
    });
  }
});

adminRoutes.route("/options", {
  name: "App.admin.options",
  action: function() {
    addTitle(`${APP_NAME} | Options`);
    return mount(AppContainer, {
      content: {
        component: OptionsContainer
      }
    });
  }
});
