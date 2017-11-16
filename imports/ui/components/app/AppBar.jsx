import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { isFbLogged } from "/imports/ui/utils/utils.jsx";

import { Menu, Dropdown, Container, Icon } from "semantic-ui-react";

export default class AppBar extends React.Component {
  constructor(props) {
    super(props);
    this._handleItemClick = this._handleItemClick.bind(this);
  }

  _handleItemClick() {
    const { currentUser } = this.props;
    if (currentUser && isFbLogged(currentUser)) {
      FlowRouter.go("App.addCampaign");
    } else {
      Alert.danger("You need to login with facebook first");
      return;
    }
  }
  _getUserInfo(currentUser) {
    if (isFbLogged(currentUser)) {
      return currentUser.services.facebook.name;
    } else {
      return currentUser.emails[0].address;
    }
  }
  _getAdminItems() {
    const { currentUser } = this.props;
    if (Roles.userIsInRole(currentUser, ["admin", "staff"])) {
      return (
        <Dropdown.Item as="a" href={FlowRouter.path("App.addContext")}>
          <Icon name="plus" /> Add Context
        </Dropdown.Item>
      );
    }
  }
  render() {
    const { loading, currentUser, logout } = this.props;

    return (
      <Menu fixed="top" id="appBar" size="large" inverted>
        <Container>
          <Menu.Item as="a" header>
            {Meteor.settings.public.appName}
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item name="signup" onClick={this._handleItemClick}>
              <Icon name="plus" /> {i18n.__("components.userMenu.addCampaign")}
            </Menu.Item>
            <Dropdown
              item
              simple
              text={currentUser ? this._getUserInfo(currentUser) : ""}
            >
              <Dropdown.Menu>
                {this._getAdminItems()}
                <Dropdown.Item onClick={logout}>
                  <Icon name="sign out" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}
