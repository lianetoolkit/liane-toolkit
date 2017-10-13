import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import moment from "moment";

import { Menu, Icon, Dropdown } from "semantic-ui-react";

if (!Meteor.isTest) {
  require("./AdminBar.less");
}

export default class AdminBar extends React.Component {
  constructor(props) {
    super(props);
    this._addServiceAccountModal = this._addServiceAccountModal.bind(this);
  }
  _addServiceAccountModal(e) {
    e.preventDefault();
    this.context.modalsStore.setCurrentModal({
      modalType: "SERVICEACCOUNTS_CREATE",
      modalData: { service: "instagram" }
    });
  }
  pathFor(pathName) {
    return FlowRouter.path(pathName);
  }
  render() {
    const {
      loading,
      currentUser,
      logout,
      toggleSideBar,
      sideBarVisible
    } = this.props;

    return (
      <Menu fixed="top" id="adminbar" size="large" className="adminbar">
        <Menu.Item className={`brand ${sideBarVisible ? "visible" : "hidden"}`}>
          {Meteor.settings.public.appName}
        </Menu.Item>
        <Menu.Item>
          <Icon link name="content" onClick={toggleSideBar} size="large" />
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item name="add-account" onClick={this._addServiceAccountModal}>
            <Icon name="add user" /> Add Account
          </Menu.Item>
          <Dropdown
            item
            text={currentUser ? currentUser.emails[0].address : ""}
          >
            <Dropdown.Menu>
              <Dropdown.Item>
                <Icon name="users" /> Profile
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout}>
                <Icon name="sign out" /> Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Menu>
      </Menu>
    );
  }
}

AdminBar.contextTypes = {
  modalsStore: PropTypes.object,
  currentUser: PropTypes.object
};
