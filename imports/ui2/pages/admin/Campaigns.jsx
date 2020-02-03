import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const messages = {};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  table {
    ul {
      margin: -1rem;
      padding: 0;
      list-style: none;
      font-size: 0.9em;
      li {
        padding: 0.5rem 1rem;
        margin: 0;
        border-bottom: 1px solid #f7f7f7;
        &:last-child {
          border-bottom: 0;
        }
      }
    }
  }
  .campaign-suspended {
    background: #f7f7f7;
    opacity: 0.8;
  }
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
`;

class CampaignsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      ticket: null,
      count: 0
    };
  }
  componentDidUpdate(prevProps) {}
  componentDidMount() {
    this.setState({ loadingCount: true });
    Meteor.call("campaigns.queryCount", { query: {} }, (err, res) => {
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
  _handleSuspendClick = campaign => ev => {
    ev.preventDefault();
    let suspend = !(campaign.status == "suspended");
    if (confirm("Are you sure?")) {
      Meteor.call("campaigns.suspend", { campaignId: campaign._id, suspend });
    }
  };
  _handleRemoveClick = campaignId => ev => {
    ev.preventDefault();
    if (confirm("Are you sure?")) {
      Meteor.call("campaigns.remove", { campaignId });
    }
  };
  render() {
    const { intl, campaigns, page, limit } = this.props;
    const { loadingCount, count } = this.state;
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
                  id="app.admin.campaigns.name"
                  defaultMessage="Name"
                />
              </th>
              <th className="fill">
                <FormattedMessage
                  id="app.admin.campaigns.facebook_page"
                  defaultMessage="Facebook Page"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.admin.campaigns.country"
                  defaultMessage="Country"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.admin.campaigns.users"
                  defaultMessage="Users"
                />
              </th>
              <th>
                <FormattedMessage
                  id="app.admin.campaigns.created_label"
                  defaultMessage="Created"
                />
              </th>
            </tr>
          </thead>
          {campaigns.map(campaign => (
            <tbody key={campaign._id} className={`campaign-${campaign.status}`}>
              <tr>
                <td>{campaign.name}</td>
                <td className="fill">
                  <span className="content-action">
                    <span className="content">{campaign.accounts[0].name}</span>
                    <span className="actions">
                      <Button
                        className="small"
                        onClick={this._handleSuspendClick(campaign)}
                      >
                        {campaign.status != "suspended" ? (
                          <FormattedMessage
                            id="app.admin.campaigns.suspend"
                            defaultMessage="Suspend"
                          />
                        ) : (
                          <FormattedMessage
                            id="app.admin.campaigns.activate"
                            defaultMessage="Activate"
                          />
                        )}
                      </Button>
                      <Button
                        className="small remove"
                        onClick={this._handleRemoveClick(campaign._id)}
                      >
                        <FormattedMessage
                          id="app.admin.campaigns.remove"
                          defaultMessage="Remove"
                        />
                      </Button>
                    </span>
                  </span>
                </td>
                <td className="small">{campaign.country}</td>
                <td className="small">
                  <ul>
                    {campaign.users.map(user => (
                      <li key={user._id}>{user.name}</li>
                    ))}
                  </ul>
                </td>
                <td className="small">
                  {moment(campaign.createdAt).format("LLL")}
                </td>
              </tr>
            </tbody>
          ))}
        </Table>
      </Container>
    );
  }
}

CampaignsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CampaignsPage);
