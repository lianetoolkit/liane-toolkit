import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const messages = defineMessages({});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  .new-person {
    position: absolute;
    bottom: 1rem;
    right: 2rem;
    .button {
      background: #003399;
      border: 0;
      color: #fff;
      margin: 0;
      &:hover,
      &:active,
      &:focus {
        background: #333;
      }
    }
  }
  .invite-id {
    font-family: monospace;
    color: #666;
    text-transform: uppercase;
  }
  .content-action {
    display: flex;
    text-align: left;
    .content {
      flex: 1 1 100%;
      font-size: 0.8em;
      display: flex;
      align-items: center;
    }
    .text {
      color: #999;
    }
    .actions {
      flex: 0 0 auto;
      font-size: 0.9em;
      a {
        color: #63c;
        &.remove {
          color: red;
          border-color: red;
        }
        &:hover {
          color: #fff;
        }
      }
    }
  }
  .fa-check,
  .fa-ban {
    float: left;
    margin-right: 1rem;
    font-size: 18px;
  }
  .fa-check {
    color: green;
  }
  .fa-ban {
    color: red;
  }
`;

class CampaignsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      count: 0
    };
  }
  componentDidUpdate(prevProps) {}
  componentDidMount() {
    this.setState({ loadingCount: true });
    Meteor.call("feedback.queryCount", { query: {} }, (err, res) => {
      this.setState({ loadingCount: false, count: res });
    });
  }
  createInvite = () => {
    Meteor.call("invites.new");
  };
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
  _handleDesignateClick = inviteId => ev => {
    ev.preventDefault();
    Meteor.call("invites.designate", { inviteId });
  };
  _handleRemoveClick = inviteId => ev => {
    ev.preventDefault();
    Meteor.call("invites.remove", { inviteId });
  };
  _handleNewClick = ev => {
    ev.preventDefault();
    this.createInvite();
  };
  render() {
    const { intl, invites, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    console.log(invites);
    return (
      <Container>
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
              <th>
                <FormattedMessage
                  id="app.admin.invites.invite_id"
                  defaultMessage="Invite ID"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.admin.invites.designated"
                  defaultMessage="Designated"
                />
              </th>
              <th className="fill">
                <FormattedMessage
                  id="app.admin.invites.available"
                  defaultMessage="Available"
                />
              </th>
              <th className="fill">
                <FormattedMessage
                  id="app.admin.invites.created"
                  defaultMessage="Created"
                />
              </th>
            </tr>
          </thead>
          {invites.map(invite => (
            <tbody key={invite._id}>
              <tr>
                <td className="small invite-id">{invite.key}</td>
                <td>
                  <span className="content-action">
                    {invite.designated ? (
                      <span className="content">
                        <FontAwesomeIcon icon="check" />
                      </span>
                    ) : (
                      <>
                        <span className="content">
                          <FontAwesomeIcon icon="ban" />
                        </span>
                        <span className="actions">
                          <Button
                            className="small"
                            onClick={this._handleDesignateClick(invite._id)}
                          >
                            Mark as designated
                          </Button>
                        </span>
                      </>
                    )}
                  </span>
                </td>
                <td className="fill">
                  <span className="content-action">
                    <span className="content">
                      <span className="icon">
                        {invite.used ? (
                          <FontAwesomeIcon icon="ban" />
                        ) : (
                          <FontAwesomeIcon icon="check" />
                        )}
                      </span>
                      {invite.user ? (
                        <span className="text">Used by {invite.user.name}</span>
                      ) : null}
                    </span>
                    <span className="actions">
                      <Button
                        className="small remove"
                        onClick={this._handleRemoveClick(invite._id)}
                      >
                        Remove invite
                      </Button>
                    </span>
                  </span>
                </td>
                <td className="small">
                  {moment(invite.createdAt).format("LLL")}
                </td>
              </tr>
            </tbody>
          ))}
        </Table>
        <div className="new-person">
          <Button onClick={this._handleNewClick}>+ New invite</Button>
        </div>
      </Container>
    );
  }
}

CampaignsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CampaignsPage);
