import React, { Component } from "react";
import Page from "../components/Page.jsx";

export default class AppLayout extends Component {
  componentWillReceiveProps({ isLoggedIn, connected, routeName }) {
    if (connected && !isLoggedIn && routeName !== "App.auth") {
      FlowRouter.go("App.auth");
    }
  }
  render() {
    const { content, connected } = this.props;
    if (connected) {
      return (
        <Page>
          <content.component {...this.props} />
        </Page>
      );
    } else {
      return null;
    }
  }
}
