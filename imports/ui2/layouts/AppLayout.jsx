import React, { Component } from "react";
import { IntlProvider, addLocaleData } from "react-intl";
import { ClientStorage } from "meteor/ostrio:cstorage";

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
import InviteNotification from "../components/InviteNotification.jsx";

import { FeedbackButton } from "../components/Feedback.jsx";

let language =
  (navigator.languages && navigator.languages[0]) ||
  navigator.language ||
  navigator.userLanguage;

const findLocale = (language) => {
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

const publicRoutes = [
  "App.dashboard",
  "App.transparency",
  "App.register",
  "App.resetPassword",
];

export default class AppLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      locale: "en",
    };
  }
  componentDidMount() {
    this.setLanguage();
  }
  componentDidUpdate(prevProps) {
    if (this.props.user && !prevProps.user) {
      this.setLanguage();
    }
  }
  setLanguage = () => {
    const { user } = this.props;
    const sessionLanguage = ClientStorage.get("language");
    if (user && user.userLanguage) language = user.userLanguage;
    if (sessionLanguage) language = sessionLanguage;
    const locale = localeData[findLocale(language)] ? language : "en";
    if (user && !user.userLanguage) {
      Meteor.call("users.setLanguage", { language: locale });
    }
    ClientStorage.set("language", locale);
    this.setState({
      locale,
    });
    updateDepsLocales(locale);
  };
  componentWillReceiveProps({ isLoggedIn, connected, routeName }) {
    FlowRouter.withReplaceState(function () {
      if (connected && !isLoggedIn && publicRoutes.indexOf(routeName) == -1) {
        FlowRouter.go("App.dashboard");
      }
    });
  }
  render() {
    const { ready, connected, isLoggedIn, campaign, user } = this.props;
    const { locale } = this.state;
    const messages = localeData[locale];
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
        <IntlProvider locale={locale} messages={messages}>
          <div id="app">
            <Page {...this.props}>
              <InviteNotification invite={this.props.invite} />
              <content.component {...this.props} />
            </Page>
            <Modal />
            <Alerts />
            {user ? <AuthConfirm user={user} /> : null}
            <FeedbackButton />
          </div>
        </IntlProvider>
      );
    } else {
      return null;
    }
  }
}
