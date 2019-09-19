import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import Table from "/imports/ui2/components/Table.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

export default class TicketsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      count: 0
    };
  }
  componentDidMount() {
    this.setState({ loadingCount: true });
    Meteor.call("feedback.queryCount", { query: {} }, (err, res) => {
      this.setState({ loadingCount: false, count: res });
    });
  }
  _handleNext = () => {
    const { page, limit } = this.props;
    const { count } = this.state;
    if ((page - 1) * limit + limit < count) {
      FlowRouter.setQueryParams({ page: page + 1 });
    }
  };
  _handlePrev = () => {
    const { page } = this.props;
    if (page > 1) {
      FlowRouter.setQueryParams({ page: page - 1 });
    }
  };
  render() {
    const { tickets, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    return (
      <Page.Content full compact>
        <PagePaging
          skip={page - 1}
          limit={limit}
          count={count}
          loading={loadingCount}
          onNext={this._handleNext}
          onPrev={this._handlePrev}
        />
        <Table compact>
          <thead>
            <tr>
              <th>Status</th>
              <th>Category</th>
              <th className="fill">Subject</th>
              <th>Author</th>
              <th>Created</th>
            </tr>
          </thead>
          {tickets.map(ticket => (
            <tbody key={ticket._id}>
              <tr>
                <td className="small">{ticket.status}</td>
                <td className="small">{ticket.category}</td>
                <td className="fill">{ticket.subject}</td>
                <td>{ticket.name}</td>
                <td className="small">{moment(ticket.createdAt).format("LLL")}</td>
              </tr>
            </tbody>
          ))}
        </Table>
      </Page.Content>
    );
  }
}
