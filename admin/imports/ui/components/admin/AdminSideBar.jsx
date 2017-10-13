import React, { Component } from "react";
import { createContainer } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { truncateText } from "/imports/utils/common.js";
import { FlowHelpers } from "/imports/ui/utils/FlowHelpers.jsx";
import { Menu, Icon } from "semantic-ui-react";

if (!Meteor.isTest) {
  require("./AdminSideBar.less");
}

export default class AdminSideBar extends React.Component {
  constructor(props) {
    super(props);
    console.log("AdminSideBar", { props });
  }
  _getPath(pathName) {
    return FlowRouter.path(pathName);
  }
  truncateUsersEmail() {
    const { currentUser } = this.props;
    const email = currentUser && currentUser.emails[0].address;
    const truncatedEmail = truncateText(email, 18);

    return truncatedEmail;
  }
  render() {
    const { loading, currentUser, visible } = this.props;
    const styles = {};
    if (!visible) {
      styles.marginLeft = -210;
    }
    return (
      <Menu fixed="left" vertical inverted id="adminsidebar" style={styles}>
        <Menu.Item
          href={this._getPath("Admin.dashboard")}
          active={FlowHelpers.currentRoute("Accounts.dashboard")}
        >
          <Icon name="dashboard" />
          Dashboard
        </Menu.Item>
        <Menu.Item
          href={this._getPath("Admin.users")}
          active={FlowHelpers.currentRoute("Admin.users")}
        >
          <Icon name="users" />
          Users
        </Menu.Item>

        <Menu.Item
          href={this._getPath("Admin.proxies")}
          active={FlowHelpers.currentRoute("Admin.proxies")}
        >
          <Icon name="sitemap" />
          Proxies
        </Menu.Item>

        <Menu.Item
          href={this._getPath("Admin.jobs")}
          active={FlowHelpers.currentRoute("Admin.jobs")}
        >
          <Icon name="tasks" />
          Jobs
        </Menu.Item>
        <Menu.Item
          href={this._getPath("Admin.usersEvents")}
          active={FlowHelpers.currentRoute("Admin.usersEvents")}
        >
          <Icon name="calendar" />
          Users Events
        </Menu.Item>
      </Menu>
    );
  }
}
