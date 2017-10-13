import React, { Component } from "react";
import { Dropdown } from "semantic-ui-react";
import { Roles } from "meteor/alanning:roles";

export default class UsersChangeRole extends React.Component {
  constructor(props) {
    super(props);
    this._selectRole = this._selectRole.bind(this);
    this.state = {
      loading: false
    };
  }
  _selectRole(e, value) {
    e.preventDefault();
    const { user } = this.props;
    const role = value.children;
    this.setState({ loading: true });
    Meteor.call(
      "users.changeRole",
      { targetUserId: user._id, role },
      (error, data) => {
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Role has been changed succesfully");
        }
        this.setState({ loading: false });
      }
    );
  }
  _getAvailableRoles() {
    const { user } = this.props;
    const userRoles = user.roles;
    let roles = Users.allowedRolesForStaff;
    if (Roles.userIsInRole(user, "admin")) {
      roles = Users.allowedRolesForAdmins;
    }
    return _.difference(roles, userRoles);
  }

  render() {
    const { currentUser } = this.props;
    return (
      <Dropdown
        text="Change Role"
        icon="exchange"
        floating
        labeled
        button
        basic
        className={`icon ${this.state.loading ? "loading" : ""}`}
      >
        <Dropdown.Menu>
          <Dropdown.Header icon="user" content="Select Role" />
          <Dropdown.Divider />
          {this._getAvailableRoles().map(role =>
            <Dropdown.Item key={role} onClick={this._selectRole}>
              {role}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
