import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

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

class UsersPage extends Component {
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
    Meteor.call("users.queryCount", { query: this.props.query }, (err, res) => {
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
  _getEmail(user) {
    return user.emails && user.emails.length ? user.emails[0].address : "";
  }
  _handleExportClick = (ev) => {
    ev.preventDefault();
    Meteor.call("users.export", (err, res) => {
      download(res, "users.csv");
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
    const { users, page, limit } = this.props;
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
              id="app.admin.users.export"
              defaultMessage="Export in CSV"
            />
          </Button>
        </PagePaging>
        <TableContainer>
          <Table compact>
            <thead>
              <tr>
                <th className="fill">
                  <FormattedMessage
                    id="app.admin.users.name"
                    defaultMessage="Name"
                  />
                </th>
                <th className="fill">
                  <FormattedMessage
                    id="app.admin.users.email"
                    defaultMessage="Email"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.users.type"
                    defaultMessage="Account type"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.user.campaigns"
                    defaultMessage="Campaigns"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.users.created_label"
                    defaultMessage="Created"
                  />
                </th>
              </tr>
            </thead>
            {users.map((user) => (
              <tbody key={user._id}>
                <tr>
                  <td className="fill">{user.name}</td>
                  <td className="fill">{this._getEmail(user)}</td>
                  <td className="small">{user.type}</td>
                  <td className="small">
                    <ul>
                      {user.campaigns.map((campaign) => (
                        <li key={campaign._id}>{campaign.name}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="small">
                    {moment(user.createdAt).format("L")}
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

UsersPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(UsersPage);
