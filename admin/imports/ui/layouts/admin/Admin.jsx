import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";

import AdminBar from "/imports/ui/components/admin/AdminBar.jsx";
import AdminFooter from "/imports/ui/components/admin/AdminFooter.jsx";
import AdminSideBar from "/imports/ui/components/admin/AdminSideBar.jsx";
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
  require("./Admin.less");
  require("/imports/ui/stylesheets/styles.less");
}

// Pages
const CONNECTION_ISSUE_TIMEOUT = 5000;

export default class Admin extends React.Component {
  constructor(props) {
    super(props);
    console.log("Admin init", { props });
    this.logout = this.logout.bind(this);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.modalsStore = new ModalsStore();
    this.confirmStore = new ConfirmStore();
    let sideBarVisible = true;
    if ($(window).width() < 720) {
      sideBarVisible = false;
    }
    this.state = {
      showConnectionIssue: false,
      sideBarVisible
    };
  }

  componentWillReceiveProps({ currentUser, loading }) {
    if (!loading && !currentUser) {
      const current = FlowRouter.current();
      console.log(current);
      let loginPath = "/signin";
      if (current.route.name != "Accounts.dashboard") {
        const next = current.path;
        loginPath = `/signin?next=${next}`;
      }
      FlowRouter.go(loginPath);
    }
  }

  updateDimensions() {
    // console.log("updateDimensions");
    this.setState({ width: $(window).width(), height: $(window).height() });
    if ($(window).width() < 720) {
      this.setState({ sideBarVisible: false });
    } else {
      this.setState({ sideBarVisible: true });
    }
  }

  componentWillMount() {
    console.log("app will mount");
    // this.updateDimensions();
  }
  componentDidMount() {
    console.log("app did mount");
    document.body.className = "";
    window.addEventListener("resize", this.updateDimensions);
    this.updateDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
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

  toggleSideBar = () => {
    console.log("toggleSideBar");
    this.setState({ sideBarVisible: !this.state.sideBarVisible });
  };

  render() {
    // console.log("app render", { state: this.state });
    const { showConnectionIssue } = this.state;
    const { currentUser, connected, loading, children, location } = this.props;

    const { sideBarVisible } = this.state;
    const mainStyles = {};
    const footerStyles = {};
    if (sideBarVisible) {
      mainStyles.marginLeft = 210;
      footerStyles.paddingLeft = 210;
    }
    return (
      <div style={{ height: "100%" }}>
        {!currentUser ? (
          <Dimmer active={true}>
            <Loader>Loading</Loader>
          </Dimmer>
        ) : (
          <Container fluid id="app-container">
            <AdminSideBar visible={sideBarVisible} />
            <div id="main" style={mainStyles}>
              <AdminBar
                currentUser={currentUser}
                logout={this.logout}
                toggleSideBar={this.toggleSideBar}
                sideBarVisible={sideBarVisible}
              />

              <ModalManager />
              <ConfirmManager />
              <Grid>
                <Grid.Row>
                  <Grid.Column>
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
                            <this.props.content.component
                              {...this.props.content.props}
                              currentUser={currentUser}
                            />
                          </div>
                        ) : (
                          ""
                        )}
                      </ReactCSSTransitionGroup>
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
            <AdminFooter styles={footerStyles} />
          </Container>
        )}
      </div>
    );
  }
}
Admin.propTypes = {
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

Admin.childContextTypes = {
  modalsStore: PropTypes.object,
  confirmStore: PropTypes.object,
  currentUser: PropTypes.object
};
