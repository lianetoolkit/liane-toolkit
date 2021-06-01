import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import download from "/imports/ui2/utils/download";

import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const messages = defineMessages({
  refetchFBToken: {
    id: "app.admin.campaigns.refetch_fb_token",
    defaultMessage: "Refetch Facebook Token",
  },
  fbTokenHealthy: {
    id: "app.admin.campaigns.fb_token_label.healthy",
    defaultMessage: "Healthy",
  },
  fbTokenPending: {
    id: "app.admin.campaigns.fb_token_label.pending",
    defaultMessage: "Verifying",
  },
  fbTokenUnhealthy: {
    id: "app.admin.campaigns.fb_token_label.unhealthy",
    defaultMessage: "Not valid",
  },
  fbTokenUndefined: {
    id: "app.admin.campaigns.fb_token_label.undefined",
    defaultMessage: "Not available",
  },
});

const Container = styled.div`
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
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
    td.compact {
      font-size: 0.8em;
    }
    .fb-token-button {
      margin: 0;
      background: transparent;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-color: #999;
      color: #999;
      font-size: 0.7em;
      &.healthy {
        color: green;
        border-color: green;
      }
      &.unhealthy {
        color: red;
        border-color: red;
      }
      svg {
        margin-right: 0.25rem;
      }
      .fa-spinner {
        animation: rotate 2s linear infinite;
      }
      &:hover {
        background-color: #333;
      }
    }
    a.small {
      font-size: 0.7em;
      color: #63c;
      margin: 0 auto;
      margin-right: 0.5rem;
      &:last-child {
        margin-right: 0;
      }
      &.remove {
        color: red;
        border-color: red;
      }
      &:hover {
        color: #fff;
      }
    }
  }
  .campaign-suspended {
    background: #f7f7f7;
    opacity: 0.8;
  }
`;

const TableContainer = styled.div`
  flex: 1 1 100%;
  overflow-x: hidden;
  overflow-y: auto;
  transition: opacity 0.1s linear;
`;

const Filters = styled.form`
  position: relative;
  z-index: 100;
  flex: 0 0 auto;
  display: flex;
  flex-direction: row;
  background: #fff;
  border-bottom: 1px solid #ccc;
  > div {
    flex: 1 1 100%;
    border-right: 1px solid #ccc;
    &.collapse {
      flex: 0 0 auto;
    }
    &.clear {
      font-size: 0.8em;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    &:last-child {
      border: 0;
    }
    input {
      margin: 0;
      border: 0;
    }
  }
`;

class CampaignsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      ticket: null,
      count: 0,
      filters: {},
    };
  }
  componentDidUpdate(prevProps) {}
  componentDidMount() {
    this.setState({
      loadingCount: true,
      filters: FlowRouter.current().queryParams,
    });
    Meteor.call(
      "campaigns.queryCount",
      { query: this.props.query },
      (err, res) => {
        this.setState({ loadingCount: false, count: res });
      }
    );
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
  _handleSuspendClick = (campaign) => (ev) => {
    ev.preventDefault();
    let suspend = !(campaign.status == "suspended");
    if (confirm("Are you sure?")) {
      Meteor.call("campaigns.suspend", { campaignId: campaign._id, suspend });
    }
  };
  _handleRemoveClick = (campaignId) => (ev) => {
    ev.preventDefault();
    if (confirm("Are you sure?")) {
      Meteor.call("campaigns.remove", { campaignId });
    }
  };
  _getHealthStatus = (campaign) => {
    const job = campaign.jobs.find(
      (job) => job.type == "campaigns.healthCheck"
    );
    if (!job) return false;
    switch (job.status) {
      case "waiting":
        return "healthy";
      case "running":
      case "ready":
        return "pending";
      default:
        return "unhealthy";
    }
  };
  _getHealthJobIcon = (campaign) => {
    const status = this._getHealthStatus(campaign);
    switch (status) {
      case "healthy":
        return "check";
      case "pending":
        return "spinner";
      case "unhealthy":
        return "ban";
      default:
        return "question";
    }
  };
  _getHealthJobLabel = (campaign) => {
    const { intl } = this.props;
    const status = this._getHealthStatus(campaign);
    switch (status) {
      case "healthy":
        return intl.formatMessage(messages.fbTokenHealthy);
      case "pending":
        return intl.formatMessage(messages.fbTokenPending);
      case "unhealthy":
        return intl.formatMessage(messages.fbTokenUnhealthy);
      default:
        return intl.formatMessage(messages.fbTokenUndefined);
    }
  };
  _handleHealthCheckClick = (campaignId) => (ev) => {
    ev.preventDefault();
    Meteor.call("campaigns.refreshHealthCheck", { campaignId });
  };
  _handleExportClick = (ev) => {
    ev.preventDefault();
    Meteor.call("campaigns.export", (err, res) => {
      download(res, "campaigns.csv");
    });
  };
  _handleFilterSubmit = (ev) => {
    ev.preventDefault();
    FlowRouter.setQueryParams({ ...this.state.filters, page: 1 });
  };
  _handleSearchChange = (ev) => {
    this.setState({ filters: { ...this.state.filters, q: ev.target.value } });
  };
  _hasFilters = () => {
    return !!Object.keys(FlowRouter.current().queryParams).filter(
      (param) => param != "page"
    ).length;
  };
  _clearFilter = (ev) => {
    ev.preventDefault();
    this.setState({ filters: {} });
    FlowRouter.setQueryParams({ q: null, page: null });
  };
  render() {
    const { intl, campaigns, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    return (
      <Container>
        <Filters onSubmit={this._handleFilterSubmit}>
          <div>
            <input
              type="text"
              onChange={this._handleSearchChange}
              placeholder="Search: type a name and press enter"
              value={this.state.filters.q}
            />
          </div>
          {this._hasFilters() ? (
            <div className="collapse clear">
              <a href="#" onClick={this._clearFilter}>
                Clear filter
              </a>
            </div>
          ) : null}
        </Filters>
        <PagePaging
          skip={page - 1}
          limit={limit}
          count={count}
          loading={loadingCount}
          onNext={this._handleNext}
          onPrev={this._handlePrev}
        >
          <Button primary onClick={this._handleExportClick}>
            <FormattedMessage
              id="app.admin.campaigns.export"
              defaultMessage="Export in CSV"
            />
          </Button>
        </PagePaging>
        <TableContainer>
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
                    id="app.admin.campaigns.facebook_connection"
                    defaultMessage="Connection"
                  />
                </th>
                <th />
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
            {campaigns.map((campaign) => (
              <tbody
                key={campaign._id}
                className={`campaign-${campaign.status}`}
              >
                <tr>
                  <td>{campaign.name}</td>
                  <td className="fill compact">{campaign.accounts[0].name}</td>
                  <td className="compact">
                    <span
                      data-tip={intl.formatMessage(messages.refetchFBToken)}
                      data-for={`fb-token-${campaign._id}`}
                    >
                      <Button
                        className={`small fb-token-button ${this._getHealthStatus(
                          campaign
                        )}`}
                        onClick={this._handleHealthCheckClick(campaign._id)}
                      >
                        <FontAwesomeIcon
                          icon={this._getHealthJobIcon(campaign)}
                        />
                        {this._getHealthJobLabel(campaign)}
                      </Button>
                    </span>
                    <ReactTooltip
                      id={`fb-token-${campaign._id}`}
                      effect="solid"
                    />
                  </td>
                  <td className="compact">
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
                  </td>
                  <td className="small">{campaign.country}</td>
                  <td className="small">
                    <ul>
                      {campaign.users.map((user) => (
                        <li key={user._id}>{user.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="small">
                    {moment(campaign.createdAt).format("L")}
                  </td>
                </tr>
              </tbody>
            ))}
          </Table>
        </TableContainer>
      </Container>
    );
  }
}

CampaignsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignsPage);
