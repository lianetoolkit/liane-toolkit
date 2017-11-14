import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import moment from "moment";

export default class AccountPeople extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() {
    const { people } = this.props;
    return (
      <Table.Row key={index}>
        <Table.Cell>{person._id}</Table.Cell>
        <Table.Cell>{person.likesCount}</Table.Cell>
        <Table.Cell>{person.commentsCount}</Table.Cell>
        <Table.Cell>dale</Table.Cell>
      </Table.Row>
    );
  }
}
