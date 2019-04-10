import React, { Component } from "react";
import Modal from "../containers/Modal.jsx";
import Page from "../components/Page.jsx";

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
        <div id="app">
          <Page {...this.props}>
            <content.component {...this.props} />
          </Page>
          <Modal />
        </div>
      );
    } else {
      return null;
    }
  }
}
