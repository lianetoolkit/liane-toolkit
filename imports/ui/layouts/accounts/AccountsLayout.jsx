import React, { Component } from "react";
import ReactCSSTransitionGroup from "react-addons-css-transition-group";
import PropTypes from "prop-types";
const CONNECTION_ISSUE_TIMEOUT = 5000;

import "./AccountsLayout.less";
// import "/imports/ui/stylesheets/bootstrap/icons.min.css";
import {
  Container,
  Button,
  Image,
  Icon,
  Grid,
  Header
} from "semantic-ui-react";

export default class AccountsLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps({ isLoggedIn, routeName }) {
    console.log("Accounts componentWillReceiveProps:", {
      routeName: routeName
    });

    if (routeName == "App.home") {
      FlowRouter.go("Accounts.signin");
    }
    if (isLoggedIn) {
      FlowRouter.go("App.dashboard");
    }
  }

  componentWillMount() {
    document.body.className = "login";
  }

  render() {
    const { user, connected, children, location } = this.props;
    return (
      <Grid className="middle center aligned">
        <Grid.Column>
          <Header as="h1" color="red" className="siteFont" size="huge">
            {Meteor.settings.public.appName}
          </Header>
          <ReactCSSTransitionGroup
            transitionName="fade"
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
          >
            {this.props.content}
          </ReactCSSTransitionGroup>
        </Grid.Column>
      </Grid>
    );
  }
}
