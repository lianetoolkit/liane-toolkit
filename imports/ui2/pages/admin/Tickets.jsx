import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import Table from "/imports/ui2/components/Table.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

export default class TicketsPage extends Component {
  render() {
    const { tickets } = this.props;
    return (
      <Page.Content full compact>
        <PagePaging />
        <Table compact>
          <thead>
            <tr>
              <th>Status</th>
              <th>Category</th>
              <th>Author</th>
              <th>Subject</th>
              <th>Created</th>
            </tr>
          </thead>
          {tickets.map(ticket => (
            <tbody key={ticket._id}>
              <tr>
                <td>{ticket.resolved}</td>
                <td>{ticket.category}</td>
                <td>{ticket.name}</td>
                <td>{ticket.subject}</td>
                <td>{moment(ticket.createdAt).format("LLL")}</td>
              </tr>
            </tbody>
          ))}
        </Table>
      </Page.Content>
    );
  }
}
