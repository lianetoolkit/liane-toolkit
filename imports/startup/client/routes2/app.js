import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";
import { pick } from "lodash";

import App from "/imports/ui2/containers/App.jsx";
import MyAccount from "/imports/ui2/pages/MyAccount.jsx";

import MessagePage from "/imports/ui2/pages/Message.jsx";

import PeopleFormPage from "/imports/ui2/containers/PeopleFormPage.jsx";

import PeoplePage from "/imports/ui2/pages/PeoplePage.jsx";
import UnresolvedPage from "/imports/ui2/containers/UnresolvedPage.jsx";
import FormSettingsPage from "/imports/ui2/pages/FormSettings.jsx";
import MapPage from "/imports/ui2/containers/MapPage.jsx";
import FAQPage from "/imports/ui2/containers/FAQPage.jsx";
import CommentsPage from "/imports/ui2/containers/CommentsPage.jsx";
import PeopleSinglePage from "/imports/ui2/containers/PeopleSinglePage.jsx";

import CampaignInvitePage from "/imports/ui2/pages/campaign/Invite.jsx";
import CampaignSettingsPage from "/imports/ui2/pages/campaign/settings/General.jsx";
import CampaignFacebookPage from "/imports/ui2/pages/campaign/settings/Facebook.jsx";
import CampaignTeamPage from "/imports/ui2/pages/campaign/settings/Team.jsx";
import CampaignConnectionsPage from "/imports/ui2/pages/campaign/settings/Connections.jsx";
import CampaignActionsPage from "/imports/ui2/pages/campaign/settings/Actions.jsx";
import NewCampaignPage from "/imports/ui2/containers/campaign/New.jsx";
import RegisterPage from "/imports/ui2/pages/Register.jsx";
import RegisterProfilePage from "/imports/ui2/pages/RegisterProfile.jsx";
import ResetPasswordPage from "/imports/ui2/pages/ResetPassword.jsx";

import AdminPage from "/imports/ui2/pages/admin/Admin.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

// app routes
const appRoutes = FlowRouter.group({
  name: "app",
  triggersEnter: [trackRouteEntry],
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      invite: queryParams.invite && queryParams.invite,
      campaignId: queryParams.campaignId,
    });
  },
});

appRoutes.route("/verify-email/:token", {
  name: "App.verifyEmail",
  action: function (params) {
    if (params.token) {
      Accounts.verifyEmail(params.token, (err) => {
        FlowRouter.go("/");
      });
    }
  },
});

appRoutes.route("/reset-password/:token", {
  name: "App.resetPassword",
  action: function (params) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      content: { component: ResetPasswordPage },
      token: params.token,
    });
  },
});

appRoutes.route("/register", {
  name: "App.register",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      contained: true,
      content: { component: RegisterPage },
      campaignInvite: queryParams.campaignInvite && queryParams.campaignInvite,
    });
  },
});

appRoutes.route("/register_profile", {
  name: "App.registerProfile",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      contained: true,
      content: { component: RegisterProfilePage },
      campaignInvite: queryParams.campaignInvite && queryParams.campaignInvite,
    });
  },
});

appRoutes.route("/f/:formId?", {
  name: "App.peopleForm",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Help the campaign!`);
    return mount(PeopleFormPage, {
      formId: params.formId,
      campaignId: queryParams.c,
      psid: queryParams.psid,
      compactForm: queryParams.compact,
      donor: queryParams.hasOwnProperty("donor"),
      volunteer: queryParams.hasOwnProperty("volunteer"),
    });
  },
});

appRoutes.route("/account", {
  name: "App.account",
  action: function () {
    addTitle(`${APP_NAME} | My account`);
    return mount(App, { content: { component: MyAccount } });
  },
});

appRoutes.route("/messages/:messageId", {
  name: "App.message",
  action: function (params) {
    addTitle(`${APP_NAME} | Message`);
    return mount(App, {
      content: { component: MessagePage },
      messageId: params.messageId,
    });
  },
});

appRoutes.route("/people", {
  name: "App.people",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | People`);
    return mount(App, {
      contained: true,
      content: { component: PeoplePage },
      query: pick(queryParams, [
        "q",
        "starred",
        "category",
        "source",
        "tag",
        "form",
        "commented",
        "private_reply",
        "creation_from",
        "creation_to",
        "reaction_count",
        "reaction_type",
      ]),
      options: pick(queryParams, ["sort", "order"]),
    });
  },
});
appRoutes.route("/people/unresolved", {
  name: "App.peopleUnresolved",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | People Unresolved `);
    return mount(App, {
      contained: true,
      content: { component: UnresolvedPage },
      options: pick(queryParams, ["sort", "order"]),
    });
  },
});

appRoutes.route("/people/:personId", {
  name: "App.people.detail",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | People`);
    return mount(App, {
      contained: true,
      content: { component: PeopleSinglePage },
      personId: params.personId,
      section: queryParams.section,
    });
  },
});

appRoutes.route("/comments", {
  name: "App.comments",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Gestão de comentários`);
    return mount(App, {
      contained: true,
      content: { component: CommentsPage },
      query: pick(queryParams, [
        "q",
        "entry",
        "source",
        "resolved",
        "category",
        "mention",
        "unreplied",
        "hideReplies",
        "privateReply",
      ]),
      page: queryParams.page,
    });
  },
});

appRoutes.route("/map", {
  name: "App.map",
  action: function () {
    addTitle(`${APP_NAME} | Territory`);
    return mount(App, { content: { component: MapPage } });
  },
});

appRoutes.route("/faq", {
  name: "App.faq",
  action: function () {
    addTitle(`${APP_NAME} | Frequently Asked Questions`);
    return mount(App, { content: { component: FAQPage } });
  },
});

appRoutes.route("/form_settings", {
  name: "App.formSettings",
  action: function () {
    addTitle(`${APP_NAME} | Form Settings`);
    return mount(App, {
      contained: true,
      content: { component: FormSettingsPage },
    });
  },
});

appRoutes.route("/campaign/invite", {
  name: "App.campaign.invite",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Campaign Invite`);
    return mount(App, {
      content: { component: CampaignInvitePage },
      campaignInviteId: queryParams.id,
    });
  },
});
appRoutes.route("/campaign/new", {
  name: "App.campaign.new",
  action: function () {
    addTitle(`${APP_NAME} | New Campaign`);
    return mount(App, {
      contained: true,
      content: { component: NewCampaignPage },
    });
  },
});
appRoutes.route("/campaign/settings", {
  name: "App.campaign.settings",
  action: function () {
    addTitle(`${APP_NAME} | Campaign Settings`);
    return mount(App, {
      contained: true,
      content: { component: CampaignSettingsPage },
    });
  },
});
appRoutes.route("/campaign/settings/facebook", {
  name: "App.campaign.facebook",
  action: function () {
    addTitle(`${APP_NAME} | Campaign Facebook Settings`);
    return mount(App, {
      contained: true,
      content: { component: CampaignFacebookPage },
    });
  },
});
appRoutes.route("/campaign/settings/connections", {
  name: "App.campaign.connections",
  action: function () {
    addTitle(`${APP_NAME} | Campaign Connections`);
    return mount(App, {
      contained: true,
      content: { component: CampaignConnectionsPage },
    });
  },
});
appRoutes.route("/campaign/settings/team", {
  name: "App.campaign.team",
  action: function () {
    addTitle(`${APP_NAME} | Campaign Team`);
    return mount(App, {
      contained: true,
      content: { component: CampaignTeamPage },
    });
  },
});
appRoutes.route("/campaign/settings/actions", {
  name: "App.campaign.actions",
  action: function () {
    addTitle(`${APP_NAME} | Campaign Actions`);
    return mount(App, {
      contained: true,
      content: { component: CampaignActionsPage },
    });
  },
});

appRoutes.route("/admin/:section?/:subsection?", {
  name: "App.admin",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME} | Administration`);
    return mount(App, {
      contained: true,
      content: {
        component: AdminPage.getSection(params.section, params.subsection),
      },
      query: { ...queryParams },
    });
  },
});

appRoutes.route("/:campaignSlug/:formId?", {
  name: "App.campaignForm",
  action: function (params, queryParams) {
    addTitle(`${APP_NAME}`);
    return mount(PeopleFormPage, {
      campaignSlug: params.campaignSlug,
      compactForm: queryParams.compact,
      formId: params.formId,
    });
  },
});
