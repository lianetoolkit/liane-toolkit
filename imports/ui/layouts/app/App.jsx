import React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";

import AppContainer from "/imports/ui/components/app/AppContainer.jsx";
import AppHeader from "/imports/ui/components/app/AppHeader.jsx";
import AppAlerts from "/imports/ui/components/app/AppAlerts.jsx";
import AppContent from "/imports/ui/components/app/AppContent.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import ConfirmStore from "/imports/ui/stores/confirmStore.js";
import ConfirmManager from "/imports/ui/components/confirm/ConfirmManager.jsx";

import { Dimmer, Loader } from "semantic-ui-react";

import { get } from "lodash";

if (!Meteor.isTest) {
  require("./App.less");
  require("/imports/ui/stylesheets/styles.less");
}

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.logout = this.logout.bind(this);
    this.confirmStore = new ConfirmStore();
    this.state = {
      showConnectionIssue: false
    };
  }

  componentWillReceiveProps({ currentUser, loading }) {
    const currentToken = get(currentUser, "services.facebook.accessToken");
    const prevToken = get(
      this.props.currentUser,
      "services.facebook.accessToken"
    );
    if (!loading && !currentUser) {
      const current = FlowRouter.current();
      let loginPath = "/signin";
      if (current.route.name != "Accounts.dashboard") {
        const next = current.path;
        loginPath = `/signin?next=${next}`;
      }
      FlowRouter.go(loginPath);
    } else if (currentToken && currentToken != prevToken) {
      Meteor.call(
        "users.validateToken",
        { token: currentToken },
        (err, res) => {
          if (err) {
            Meteor.linkWithFacebook(
              {
                requestPermissions: [
                  "public_profile",
                  "email",
                  "manage_pages",
                  "pages_show_list",
                  "ads_management",
                  "ads_read",
                  "business_management",
                  "read_page_mailboxes"
                ]
              },
              err => {
                if (err) {
                  console.log(err);
                } else {
                  Meteor.call("users.exchangeFBToken", (err, data) => {
                    if (err) {
                      console.log(err);
                    }
                  });
                }
              }
            );
          }
        }
      );
    }
  }

  getChildContext() {
    return {
      confirmStore: this.confirmStore,
      currentUser: this.props.currentUser
    };
  }

  logout() {
    Meteor.logout(err => {
      FlowRouter.go("/signin");
    });
  }

  render() {
    const { showConnectionIssue } = this.state;
    const {
      campaigns,
      campaign,
      tags,
      account,
      audienceAccount,
      currentFacebookId,
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
            <ConfirmManager />
            <AppContent>
              <AppAlerts currentUser={currentUser} />
              {loading ? (
                <Loading />
              ) : (
                <div>
                  {currentUser ? (
                    <content.component
                      {...content.props}
                      campaign={campaign}
                      tags={tags}
                      account={account}
                      audienceAccount={audienceAccount}
                      currentFacebookId={currentFacebookId}
                      campaigns={campaigns}
                      currentUser={currentUser}
                    />
                  ) : null}
                </div>
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
  confirmStore: PropTypes.object,
  currentUser: PropTypes.object
};
