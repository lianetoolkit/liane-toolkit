import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import AppContainer from "/imports/ui/components/app/AppContainer.jsx";
import AppHeader from "/imports/ui/components/app/AppHeader.jsx";
import AppContent from "/imports/ui/components/app/AppContent.jsx";
import AppFooter from "/imports/ui/components/app/AppFooter.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import ModalsStore from "/imports/ui/stores/modalsStore.js";
import ModalManager from "/imports/ui/components/modals/ModalManager.jsx";

import ConfirmStore from "/imports/ui/stores/confirmStore.js";
import ConfirmManager from "/imports/ui/components/confirm/ConfirmManager.jsx";

import {
  Sidebar,
  Segment,
  Button,
  Menu,
  Image,
  Icon,
  Header,
  Grid,
  Dimmer,
  Loader,
  Container
} from "semantic-ui-react";

if (!Meteor.isTest) {
  // import 'semantic-ui-css/semantic.css';
  require("./App.less");
  require("/imports/ui/stylesheets/styles.less");
}

// Pages
const CONNECTION_ISSUE_TIMEOUT = 5000;

export default class App extends React.Component {
  constructor(props) {
    super(props);
    console.log("App init", { props });
    this.logout = this.logout.bind(this);
    this.modalsStore = new ModalsStore();
    this.confirmStore = new ConfirmStore();
    this.state = {
      showConnectionIssue: false
    };
  }

  componentWillReceiveProps({ currentUser, loading }) {
    if (!loading && !currentUser) {
      const current = FlowRouter.current();
      let loginPath = "/signin";
      if (current.route.name != "Accounts.dashboard") {
        const next = current.path;
        loginPath = `/signin?next=${next}`;
      }
      FlowRouter.go(loginPath);
    }
  }

  getChildContext() {
    return {
      modalsStore: this.modalsStore,
      confirmStore: this.confirmStore,
      currentUser: this.props.currentUser
    };
  }

  logout() {
    Meteor.logout(err => {
      // callback
      if (err) {
        Bert.alert(err.reason, "danger");
      }
      FlowRouter.go("/signin");
    });
  }

  render() {
    // console.log("app render", { state: this.state });
    const { showConnectionIssue } = this.state;
    const {
      campaigns,
      currentCampaign,
      currentUser,
      connected,
      loading,
      children,
      location,
      content
    } = this.props;

    return (
      <div style={{ height: "100%" }}>
        {!currentUser ? (
          <Dimmer active={true}>
            <Loader>Loading</Loader>
          </Dimmer>
        ) : (
          <AppContainer id="main">
            <AppHeader
              currentUser={currentUser}
              currentCampaign={currentCampaign}
              campaigns={campaigns}
              logout={this.logout}
            />
            {/* <AppBar currentUser={currentUser} logout={this.logout} /> */}
            <ModalManager />
            <ConfirmManager />
            <AppContent>
              {loading ? (
                <Loading />
              ) : (
                <ReactCSSTransitionGroup
                  transitionName="fade"
                  transitionEnterTimeout={200}
                  transitionLeaveTimeout={200}
                >
                  {currentUser ? (
                    <div>
                      <content.component
                        {...content.props}
                        currentUser={currentUser}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </ReactCSSTransitionGroup>
              )}
            </AppContent>
          </AppContainer>
        )}
      </div>
    );
  }
}
App.propTypes = {
  currentUser: PropTypes.object,
  // current meteor currentUser
  connected: PropTypes.bool,
  // server connection status
  loading: PropTypes.bool,
  children: PropTypes.element,
  // matched child route component
  location: PropTypes.object,
  // current router location
  // parameters of the current route
  params: PropTypes.object
};

// Admin.contextTypes = {
//   router: React.PropTypes.object
// };

App.childContextTypes = {
  modalsStore: PropTypes.object,
  confirmStore: PropTypes.object,
  currentUser: PropTypes.object
};
