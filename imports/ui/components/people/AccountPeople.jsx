import React, { Component } from "react";
import { Table } from "semantic-ui-react";
import moment from "moment";

export default class AccountPeople extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { facebookId, people, loading } = this.props;
    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>FacebookId</Table.HeaderCell>
            <Table.HeaderCell>Likes</Table.HeaderCell>
            <Table.HeaderCell>Comments</Table.HeaderCell>
            <Table.HeaderCell>Info</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {loading ? (
          ""
        ) : (
          <Table.Body>
            {people.map((person, index) => {
              return (
                <Table.Row key={index}>
                  <Table.Cell>{person.name}</Table.Cell>
                  <Table.Cell>{person.facebookId}</Table.Cell>
                  <Table.Cell>{person.likesCount}</Table.Cell>
                  <Table.Cell>{person.commentsCount}</Table.Cell>
                  <Table.Cell />
                </Table.Row>
              );
            })}
          </Table.Body>
        )}
      </Table>
    );
  }
}
