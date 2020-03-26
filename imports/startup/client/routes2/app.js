import { FlowRouter } from "meteor/kadira:flow-router";
import React from "react";
import { mount } from "react-mounter";
import { pick } from "lodash";

import App from "/imports/ui2/containers/App.jsx";
import MyAccount from "/imports/ui2/pages/MyAccount.jsx";
import Transparency from "/imports/ui2/pages/Transparency.jsx";

import PeopleFormPage from "/imports/ui2/containers/PeopleFormPage.jsx";

import PeoplePage from "/imports/ui2/pages/People.jsx";
import FormSettingsPage from "/imports/ui2/pages/FormSettings.jsx";
import MapPage from "/imports/ui2/containers/MapPage.jsx";
import FAQPage from "/imports/ui2/containers/FAQPage.jsx";
import CommentsPage from "/imports/ui2/containers/CommentsPage.jsx";
import PeopleSinglePage from "/imports/ui2/containers/PeopleSinglePage.jsx";

import AdsetPage from "/imports/ui2/pages/Adset.jsx";

import ChatbotPage from "/imports/ui2/pages/chatbot/index.jsx";

import CampaignInvitePage from "/imports/ui2/pages/campaign/Invite.jsx";
import CampaignSettingsPage from "/imports/ui2/pages/campaign/settings/General.jsx";
import CampaignFacebookPage from "/imports/ui2/pages/campaign/settings/Facebook.jsx";
import CampaignTeamPage from "/imports/ui2/pages/campaign/settings/Team.jsx";
import CampaignActionsPage from "/imports/ui2/pages/campaign/settings/Actions.jsx";
import NewCampaignPage from "/imports/ui2/containers/campaign/New.jsx";
import RegisterPage from "/imports/ui2/pages/Register.jsx";
import ResetPasswordPage from "/imports/ui2/pages/ResetPassword.jsx";

import AdminPage from "/imports/ui2/pages/admin/Admin.jsx";

import { APP_NAME, addTitle, trackRouteEntry } from "./utils.js";

// app routes
const appRoutes = FlowRouter.group({
  name: "app",
  triggersEnter: [trackRouteEntry]
});

appRoutes.route("/", {
  name: "App.dashboard",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      invite: queryParams.invite && queryParams.invite
    });
  }
});

appRoutes.route("/verify-email/:token", {
  name: "App.verifyEmail",
  action: function(params) {
    if (params.token) {
      Accounts.verifyEmail(params.token, err => {
        FlowRouter.go("/");
      });
    }
  }
});

appRoutes.route("/reset-password/:token", {
  name: "App.resetPassword",
  action: function(params) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      content: { component: ResetPasswordPage },
      token: params.token
    });
  }
});

appRoutes.route("/register", {
  name: "App.register",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Technology for Political Innovation`);
    return mount(App, {
      content: { component: RegisterPage },
      campaignInvite: queryParams.campaignInvite && queryParams.campaignInvite
    });
  }
});

appRoutes.route("/transparency", {
  name: "App.transparency",
  action: function() {
    addTitle(`${APP_NAME} | Transparency`);
    return mount(App, { content: { component: Transparency } });
  }
});

appRoutes.route("/f/:formId?", {
  name: "App.peopleForm",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Help the campaign!`);
    return mount(PeopleFormPage, {
      formId: params.formId,
      campaignId: queryParams.c,
      psid: queryParams.psid,
      donor: queryParams.hasOwnProperty("donor"),
      volunteer: queryParams.hasOwnProperty("volunteer")
    });
  }
});

appRoutes.route("/account", {
  name: "App.account",
  action: function() {
    addTitle(`${APP_NAME} | My account`);
    return mount(App, { content: { component: MyAccount } });
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
      personId: params.personId,
      section: queryParams.section
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
        "entry",
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
    addTitle(`${APP_NAME} | Territory`);
    return mount(App, { content: { component: MapPage } });
  }
});

appRoutes.route("/faq", {
  name: "App.faq",
  action: function() {
    addTitle(`${APP_NAME} | Frequently Asked Questions`);
    return mount(App, { content: { component: FAQPage } });
  }
});

appRoutes.route("/form_settings", {
  name: "App.formSettings",
  action: function() {
    addTitle(`${APP_NAME} | Form Settings`);
    return mount(App, { content: { component: FormSettingsPage } });
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

appRoutes.route("/campaign/invite", {
  name: "App.campaign.invite",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Campaign Invite`);
    return mount(App, {
      content: { component: CampaignInvitePage },
      campaignInviteId: queryParams.id
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
appRoutes.route("/campaign/settings/facebook", {
  name: "App.campaign.facebook",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Facebook Settings`);
    return mount(App, { content: { component: CampaignFacebookPage } });
  }
});
appRoutes.route("/campaign/settings/team", {
  name: "App.campaign.team",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Team`);
    return mount(App, { content: { component: CampaignTeamPage } });
  }
});
appRoutes.route("/campaign/settings/actions", {
  name: "App.campaign.actions",
  action: function() {
    addTitle(`${APP_NAME} | Campaign Actions`);
    return mount(App, { content: { component: CampaignActionsPage } });
  }
});

appRoutes.route("/admin/:section?", {
  name: "App.admin",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME} | Administration`);
    return mount(App, {
      content: { component: AdminPage.getSection(params.section) },
      query: { ...queryParams }
    });
  }
});

appRoutes.route("/:campaignSlug/:formId?", {
  name: "App.campaignForm",
  action: function(params, queryParams) {
    addTitle(`${APP_NAME}`);
    return mount(PeopleFormPage, {
      campaignSlug: params.campaignSlug,
      formId: params.formId
    });
  }
});
