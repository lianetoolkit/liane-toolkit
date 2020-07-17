import React, { Component } from "react";
import { IntlProvider, addLocaleData } from "react-intl";

import en from "react-intl/locale-data/en";
import es from "react-intl/locale-data/es";
import pt from "react-intl/locale-data/pt";
addLocaleData([...en, ...es, ...pt]);

import localeData from "/locales";

import Grid from "./Grid.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import Body from "./Body.jsx";
import Title from "./Title.jsx";

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

const style = {
  container: {
    backgroundColor: "#efefef",
    padding: "40px 20px",
    fontFamily: "sans-serif",
  },

  main: {
    maxWidth: "550px",
    width: "100%",
  },
};

class Email extends Component {
  render() {
    const { language, children } = this.props;
    const locale = findLocale(language || "en");
    return (
      <IntlProvider
        locale={locale}
        messages={localeData[locale] || localeData["en"]}
      >
        <center style={style.container}>
          <Grid style={style.main}>
            <Header />
            <Body>{children}</Body>
            <Footer />
          </Grid>
        </center>
      </IntlProvider>
    );
  }
}

export default Email;
