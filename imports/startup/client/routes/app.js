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

import PeopleFormContainer from "/imports/ui/containers/people/PeopleFormContainer.jsx";

import NotFoundPage from "/imports/ui/pages/NotFoundPage.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

FlowRouter.notFound = {
  name: "App.notFound",
  action: function() {
    addTitle(`${APP_NAME} | Page not found`);
    return mount(NotFoundPage);
  }
};

FlowRouter.route("/signin", {
  name: "Accounts.signin",
  action: function() {
    addTitle(`${APP_NAME} | Sign In`);
    return mount(AccountsContainer, { content: <AuthPageSignIn /> });
  }
});

FlowRouter.route("/join", {
  name: "Accounts.join",
  action: function(params) {
    addTitle(`${APP_NAME} | Join`);
    return mount(AccountsContainer, { content: <AuthPageJoin /> });
  }
});

FlowRouter.route("/forgot-password", {
  name: "Accounts.forgotPassword",
  action: function(params) {
    addTitle(`${APP_NAME} | Recovery Password`);
    return mount(AccountsContainer, { content: <AuthPageRecoveryPassword /> });
  }
});
FlowRouter.route("/reset-password/:token", {
  name: "Accounts.resetPassword",
  action: function(params) {
    addTitle(`${APP_NAME} | Reset Password`);
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

// app routes
const appRoutes = FlowRouter.group({
  name: "app",
  triggersEnter: [trackRouteEntry]
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function() {
    addTitle(`${APP_NAME} | Dashboard`);
    return mount(AppContainer, {
      content: { component: DashboardPageContainer }
    });
  }
});

appRoutes.route("/add-campaign", {
  name: "App.addCampaign",
  action: function() {
    addTitle(`${APP_NAME} | New Campaign`);
    return mount(AppContainer, {
      content: { component: AddCampaignPageContainer }
    });
  }
});

appRoutes.route("/f/:formId?", {
  name: "App.peopleForm",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Help your candidate`);
    return mount(PeopleFormContainer, {
      formId: params.formId,
      campaignId: queryParams.c
    });
  }
});
