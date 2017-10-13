import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";

import AdminContainer from "/imports/ui/containers/admin/AdminContainer.jsx";
import AccountsContainer from "/imports/ui/containers/accounts/AccountsContainer.jsx";

import AuthPageSignIn from "/imports/ui/pages/accounts/AuthPageSignIn.jsx";
import AuthPageJoin from "/imports/ui/pages/accounts/AuthPageJoin.jsx";
import AuthPageRecoveryPassword from "/imports/ui/pages/accounts/AuthPageRecoveryPassword.jsx";
import AuthPageResetPassword from "/imports/ui/pages/accounts/AuthPageResetPassword.jsx";

import DashboardPageContainer from "/imports/ui/containers/admin/DashboardPageContainer.jsx";
import UsersPageContainer from "/imports/ui/containers/users/UsersPageContainer.jsx";

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
const adminRoutes = FlowRouter.group({
  name: "admin",
  // prefix: "/admin",
  triggersEnter: [trackRouteEntry]
});

adminRoutes.route("/", {
  name: "Admin.dashboard",
  action: function() {
    _addTitle(`${APP_NAME} | Dashboard`);
    return mount(AdminContainer, {
      content: { component: DashboardPageContainer }
    });
  }
});

adminRoutes.route("/users", {
  name: "Admin.users",
  action: function() {
    _addTitle(`${APP_NAME} | Users`);
    return mount(AdminContainer, {
      content: { component: UsersPageContainer }
    });
  }
});
adminRoutes.route("/user/:userId/", {
  name: "Admin.userDetail",
  action: function(params) {
    _addTitle(`${APP_NAME} | ${params.userId}`);
    return mount(AdminContainer, {
      content: {
        component: UserDetailContainer,
        props: { userId: params.userId }
      }
    });
  }
});

adminRoutes.route("/user/:userId/:tab", {
  name: "Admin.userDetail",
  action: function(params) {
    _addTitle(`${APP_NAME} | ${params.userId}`);
    return mount(AdminContainer, {
      content: {
        component: UserDetailContainer,
        props: { userId: params.userId, tab: params.tab }
      }
    });
  }
});

adminRoutes.route("/jobs", {
  name: "Admin.jobs",
  action: function() {
    _addTitle(`${APP_NAME} | Jobs`);
    return mount(AdminContainer, {
      content: { component: JobsPage }
    });
  }
});

adminRoutes.route("/events", {
  name: "Admin.usersEvents",
  action: function() {
    _addTitle(`${APP_NAME} | Users Events`);
    return mount(AdminContainer, {
      content: { component: UsersEventsPage }
    });
  }
});

adminRoutes.route("/proxies", {
  name: "Admin.proxies",
  action: function() {
    _addTitle(`${APP_NAME} | Proxies`);
    return mount(AdminContainer, {
      content: { component: AdminProxiesPage }
    });
  }
});
