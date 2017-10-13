import React, { Component } from "react";
import { Table, Button, Icon } from "semantic-ui-react";
import moment from "moment";
import UsersChangeRole from "/imports/ui/components/users/utils/UsersChangeRole.jsx";
import UsersTable from "/imports/ui/components/users/UsersTable.jsx";

export default class UserInfo extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { user } = this.props;
    return (
      <div>
        <UsersTable selector={{ _id: user._id }} hideHeader={true} />
      </div>
    );
  }
}
