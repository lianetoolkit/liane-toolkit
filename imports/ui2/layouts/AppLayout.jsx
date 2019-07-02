import React, { Component } from "react";
import { IntlProvider, addLocaleData } from "react-intl";

import en from "react-intl/locale-data/en";
import es from "react-intl/locale-data/es";
import pt from "react-intl/locale-data/pt";
addLocaleData([...en, ...es, ...pt]);
window.locales = ["en-US", "es", "pt-BR"];

import localeData from "/locales";

import Modal from "../containers/Modal.jsx";
import Alerts from "../containers/Alerts.jsx";
import Page from "../components/Page.jsx";

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

const messages = localeData[findLocale(language)] || localeData.en;

export default class AppLayout extends Component {
  componentWillReceiveProps({ isLoggedIn, connected, routeName }) {
    if (connected && !isLoggedIn && routeName !== "App.auth") {
      FlowRouter.go("App.auth");
    }
    if (connected && isLoggedIn && routeName == "App.auth") {
      FlowRouter.go("App.dashboard");
    }
  }
  render() {
    const { content, ready, connected } = this.props;
    if (connected && ready) {
      return (
        <IntlProvider locale={language} messages={messages}>
          <div id="app">
            <Page {...this.props}>
              <content.component {...this.props} />
            </Page>
            <Modal />
            <Alerts />
          </div>
        </IntlProvider>
      );
    } else {
      return null;
    }
  }
}
