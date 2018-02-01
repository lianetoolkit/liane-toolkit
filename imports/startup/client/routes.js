import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import AppContainer from "/imports/ui/containers/app/AppContainer.jsx";
import AccountsContainer from "/imports/ui/containers/accounts/AccountsContainer.jsx";

import AuthPageSignIn from "/imports/ui/pages/accounts/AuthPageSignIn.jsx";
import AuthPageJoin from "/imports/ui/pages/accounts/AuthPageJoin.jsx";
import AuthPageRecoveryPassword from "/imports/ui/pages/accounts/AuthPageRecoveryPassword.jsx";
import AuthPageResetPassword from "/imports/ui/pages/accounts/AuthPageResetPassword.jsx";

import DashboardPageContainer from "/imports/ui/containers/app/DashboardPageContainer.jsx";

import AddCampaignPageContainer from "/imports/ui/containers/campaigns/AddCampaignPageContainer.jsx";
import CampaignsPageContainer from "/imports/ui/containers/campaigns/CampaignsPageContainer.jsx";
import CampaignsPeopleContainer from "/imports/ui/containers/campaigns/CampaignsPeopleContainer.jsx";
import CampaignsAudienceContainer from "/imports/ui/containers/campaigns/CampaignsAudienceContainer.jsx";
import CampaignsEntriesContainer from "/imports/ui/containers/campaigns/CampaignsEntriesContainer.jsx";
import CampaignsListsContainer from "/imports/ui/containers/campaigns/CampaignsListsContainer.jsx";

/* Admin */
import JobsPage from "/imports/ui/pages/jobs/JobsPage.jsx";

import ContextsPageContainer from "/imports/ui/containers/contexts/ContextsPageContainer.jsx";
import EditContextsPageContainer from "/imports/ui/containers/contexts/EditContextsPageContainer.jsx";

import AudienceCategoriesPageContainer from "/imports/ui/containers/audiences/AudienceCategoriesPageContainer.jsx";
import EditAudienceCategoriesPageContainer from "/imports/ui/containers/audiences/EditAudienceCategoriesPageContainer.jsx";

import GeolocationsPageContainer from "/imports/ui/containers/geolocations/GeolocationsPageContainer.jsx";
import EditGeolocationsPageContainer from "/imports/ui/containers/geolocations/EditGeolocationsPageContainer.jsx";

import NotFoundPage from "../../ui/pages/NotFoundPage.jsx";

const APP_NAME = Meteor.settings.public.appName;

const _addTitle = function(title) {
  DocHead.setTitle(title);
};

const trackRouteEntry = () => {
  Meteor.setTimeout(() => {
    const userId = Meteor.userId();
    if (userId) {
      // Woopra.track({ userId });
      console.log("trackRouteEntry");
    }
  }, 3000);
};

FlowRouter.notFound = {
  name: "App.notFound",
  action: function() {
    _addTitle(`${APP_NAME} | Page not found`);
    return mount(NotFoundPage);
  }
};

FlowRouter.route("/signin", {
  name: "Accounts.signin",
  action: function() {
    _addTitle(`${APP_NAME} | Sign In`);
    return mount(AccountsContainer, { content: <AuthPageSignIn /> });
  }
});

FlowRouter.route("/join", {
  name: "Accounts.join",
  action: function(params) {
    _addTitle(`${APP_NAME} | Join`);
    return mount(AccountsContainer, { content: <AuthPageJoin /> });
  }
});

FlowRouter.route("/forgot-password", {
  name: "Accounts.forgotPassword",
  action: function(params) {
    _addTitle(`${APP_NAME} | Recovery Password`);
    return mount(AccountsContainer, { content: <AuthPageRecoveryPassword /> });
  }
});
FlowRouter.route("/reset-password/:token", {
  name: "Accounts.resetPassword",
  action: function(params) {
    _addTitle(`${APP_NAME} | Reset Password`);
    return mount(AccountsContainer, { content: <AuthPageResetPassword /> });
  }
});

FlowRouter.route("/verify-email/:token", {
  name: "Accounts.verifyEmail",
  action: function(params) {
    Accounts.verifyEmail(params.token, error => {
      if (error) {
        Bert.alert(error.reason, "danger");
      } else {
        FlowRouter.go("App.home");
        Bert.alert("Email verified! Thanks!", "success");
      }
    });
  }
});

// admin routes
const appRoutes = FlowRouter.group({
  name: "app",
  // prefix: "/admin",
  triggersEnter: [trackRouteEntry]
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function() {
    _addTitle(`${APP_NAME} | Dashboard`);
    return mount(AppContainer, {
      content: { component: DashboardPageContainer }
    });
  }
});

appRoutes.route("/add-campaign", {
  name: "App.addCampaign",
  action: function() {
    _addTitle(`${APP_NAME} | New Campaign`);
    return mount(AppContainer, {
      content: { component: AddCampaignPageContainer }
    });
  }
});
appRoutes.route("/campaign/:campaignId", {
  name: "App.campaignDetail",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsPageContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
appRoutes.route("/campaign/:campaignId/people/:facebookId?", {
  name: "App.campaignPeople",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsPeopleContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
appRoutes.route("/campaign/:campaignId/audience/:facebookId?", {
  name: "App.campaignAudience",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsAudienceContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
appRoutes.route(
  "/campaign/:campaignId/audience/:facebookId/category/:categoryId",
  {
    name: "App.campaignAudience.category",
    action: function(params) {
      _addTitle(`${APP_NAME} | Campaign`);
      return mount(AppContainer, {
        content: {
          component: CampaignsAudienceContainer,
          props: {
            campaignId: params.campaignId,
            facebookId: params.facebookId,
            categoryId: params.categoryId
          }
        }
      });
    }
  }
);
appRoutes.route("/campaign/:campaignId/entries/:facebookId?", {
  name: "App.campaignEntries",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsEntriesContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});
appRoutes.route("/campaign/:campaignId/lists", {
  name: "App.campaignLists",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsListsContainer,
        props: { campaignId: params.campaignId }
      }
    });
  }
});
appRoutes.route("/campaign/:campaignId/account/:facebookId", {
  name: "App.campaignDetail.account",
  action: function(params) {
    _addTitle(`${APP_NAME} | Campaign`);
    return mount(AppContainer, {
      content: {
        component: CampaignsPageContainer,
        props: { campaignId: params.campaignId, facebookId: params.facebookId }
      }
    });
  }
});

appRoutes.route("/admin/jobs", {
  name: "App.admin.jobs",
  action: function() {
    _addTitle(`${APP_NAME} | Jobs`);
    return mount(AppContainer, {
      content: { component: JobsPage }
    });
  }
});

appRoutes.route("/admin/contexts", {
  name: "App.admin.contexts",
  action: function() {
    _addTitle(`${APP_NAME} | Contexts`);
    return mount(AppContainer, {
      content: { component: ContextsPageContainer }
    });
  }
});

appRoutes.route("/admin/contexts/edit/:contextId?", {
  name: "App.admin.contexts.edit",
  action: function(params) {
    _addTitle(`${APP_NAME} | Contexts`);
    return mount(AppContainer, {
      content: {
        component: EditContextsPageContainer,
        props: { contextId: params.contextId }
      }
    });
  }
});

appRoutes.route("/admin/audience-categories", {
  name: "App.admin.audienceCategories",
  action: function() {
    _addTitle(`${APP_NAME} | Audience Categories`);
    return mount(AppContainer, {
      content: { component: AudienceCategoriesPageContainer }
    });
  }
});

appRoutes.route("/admin/audience-categories/edit/:audienceCategoryId?", {
  name: "App.admin.audienceCategories.edit",
  action: function(params) {
    _addTitle(`${APP_NAME} | Audience Categories`);
    return mount(AppContainer, {
      content: {
        component: EditAudienceCategoriesPageContainer,
        props: { audienceCategoryId: params.audienceCategoryId }
      }
    });
  }
});

appRoutes.route("/admin/geolocations", {
  name: "App.admin.geolocations",
  action: function() {
    _addTitle(`${APP_NAME} | Geolocations`);
    return mount(AppContainer, {
      content: {
        component: GeolocationsPageContainer
      }
    });
  }
});

appRoutes.route("/admin/geolocations/edit/:geolocationId?", {
  name: "App.admin.geolocations.edit",
  action: function(params) {
    _addTitle(`${APP_NAME} | Geolocations`);
    return mount(AppContainer, {
      content: {
        component: EditGeolocationsPageContainer,
        props: { geolocationId: params.geolocationId }
      }
    });
  }
});
