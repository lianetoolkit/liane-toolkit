import React, { Component } from "react";
import { IntlProvider, addLocaleData } from "react-intl";

import en from "react-intl/locale-data/en";
import es from "react-intl/locale-data/es";
import pt from "react-intl/locale-data/pt";
addLocaleData([...en, ...es, ...pt]);
window.locales = ["en-US", "es", "pt-BR"];

import localeData from "/locales";

import Home from "/imports/ui2/pages/Home.jsx";
import DashboardPage from "/imports/ui2/pages/Dashboard.jsx";

import Modal from "../containers/Modal.jsx";
import Alerts from "../containers/Alerts.jsx";
import Page from "../components/Page.jsx";
import AuthConfirm from "../components/AuthConfirm.jsx";

const language =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.userLanguage;

const findLocale = language => {
  let locale = false;
  const languageWRC = language.toLowerCase().split(/[_-]+/)[0];
  for (const key in localeData) {
    let keyWRC = key.toLowerCase().split(/[_-]+/)[0];
    if (
      !locale &&
      (key == language ||
        key == languageWRC ||
        keyWRC == languageWRC ||
        keyWRC == language)
    ) {
      locale = key;
    }
  }
  return locale;
};

const messages = localeData.es || localeData[findLocale(language)] || localeData.en;

const publicRoutes = ["App.dashboard", "App.transparency"];

export default class AppLayout extends Component {
  componentWillReceiveProps({ isLoggedIn, connected, routeName }) {
    FlowRouter.withReplaceState(function() {
      if (connected && !isLoggedIn && publicRoutes.indexOf(routeName) == -1) {
        FlowRouter.go("App.dashboard");
      }
    });
  }
  render() {
    const { ready, connected, isLoggedIn, campaign, user } = this.props;
    let content;
    if (!this.props.content) {
      if (campaign) {
        content = { component: DashboardPage };
      } else {
        content = { component: Home };
      }
    } else {
      content = this.props.content;
    }
    if (connected && ready) {
      return (
        <IntlProvider locale={language} messages={messages}>
          <div id="app">
            <Page {...this.props}>
              <content.component {...this.props} />
            </Page>
            <Modal />
            <Alerts />
            {user ? <AuthConfirm user={user} /> : null}
          </div>
        </IntlProvider>
      );
    } else {
      return null;
    }
  }
}
