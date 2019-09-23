import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const TicketLabel = styled.span`
  background: #777;
  color: #fff;
  font-size: 0.8em;
  padding: 0.2rem 0.4rem;
  border-radius: 7px;
  &.bug {
    background: #ff3e3e;
  }
  &.suggestion {
    background: #46ff6f;
  }
  &.question {
    background: #467aff;
  }
`;

const TicketContainer = styled.div`
  h2 {
    margin: 0.5rem 0;
  }
  .author {
    font-style: italic;
    font-size: 0.8em;
    border-bottom: 1px solid #eee;
    color: #999;
    padding-bottom: 0.5rem;
  }
  table.context {
    border: 1px solid #eee;
    border-radius: 7px;
    font-size: 0.8em;
    width: 100%;
    border-spacing: 0;
    margin: 0 0 1rem;
    th,
    td {
      text-align: left;
      border-right: 1px solid #eee;
      border-bottom: 1px solid #eee;
      padding: 0.5rem
      &:last-child {
        border-right: 0;
      }
    }
    tr:last-child {
      th,
      td {
        border-bottom: 0;
      }
    }
  }
  .button {
    float: right;
  }
`;

class SingleTicket extends Component {
  _buttonLabel = () => {
    const { ticket } = this.props;
    if (ticket.status == "progress") {
      return "Mark as resolved";
    } else {
      return "Move to progress";
    }
  };
  _handleClick = () => {
    const { ticket } = this.props;
    const status = ticket.status == "progress" ? "resolved" : "progress";
    Meteor.call("feedback.updateStatus", {
      id: ticket._id,
      status
    });
  };
  render() {
    const { ticket } = this.props;
    let context = [];
    for (let key in ticket.context) {
      context.push({
        key,
        value: ticket.context[key]
      });
    }
    return (
      <TicketContainer>
        <TicketLabel className={ticket.category}>{ticket.category}</TicketLabel>
        <h2>{ticket.subject}</h2>
        <p className="author">
          {ticket.name} &lt;{ticket.email}&gt;
        </p>
        <p>{ticket.message}</p>
        <table className="context">
          <tbody>
            {context.map(item => (
              <tr key={item.key}>
                <th>{item.key}</th>
                <td>{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button primary onClick={this._handleClick}>
          {this._buttonLabel()}
        </Button>
        <p>
          <strong>Current status</strong>: {ticket.status}
        </p>
      </TicketContainer>
    );
  }
}

export default class TicketsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      ticket: null,
      count: 0
    };
  }
  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.ticket) != JSON.stringify(this.props.ticket)) {
      if (this.props.ticket) {
        modalStore.set(<SingleTicket ticket={this.props.ticket} />, () => {
          FlowRouter.setQueryParams({ id: null });
          return true;
        });
      }
    }
  }
  componentDidMount() {
    this.setState({ loadingCount: true });
    Meteor.call("feedback.queryCount", { query: {} }, (err, res) => {
      this.setState({ loadingCount: false, count: res });
    });
    if (this.props.ticket) {
      modalStore.set(<SingleTicket ticket={this.props.ticket} />, () => {
        FlowRouter.setQueryParams({ id: null });
        return true;
      });
    }
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
  openTicket = ticket => () => {
    FlowRouter.setQueryParams({ id: ticket._id });
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
              <tr className="interactive" onClick={this.openTicket(ticket)}>
                <td className="small">{ticket.status}</td>
                <td className="small">
                  <TicketLabel className={ticket.category}>
                    {ticket.category}
                  </TicketLabel>
                </td>
                <td className="fill">{ticket.subject}</td>
                <td>{ticket.name}</td>
                <td className="small">
                  {moment(ticket.createdAt).format("LLL")}
                </td>
              </tr>
            </tbody>
          ))}
        </Table>
      </Page.Content>
    );
  }
}
