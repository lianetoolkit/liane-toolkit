import React, { Component } from "react";
import { injectIntl, intlShape, FormattedMessage } from "react-intl";
import styled from "styled-components";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import CopyToClipboard from "/imports/ui2/components/CopyToClipboard.jsx";
import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

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
    z-index: 9999;
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
  }
  tr.used {
    opacity: 0.8;
    td {
      background: #f7f7f7;
    }
    .invite-id {
      text-decoration: line-through;
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
  a {
    .fa-copy {
      margin-right: 0.25rem;
    }
  }
  .designate-form {
    margin -0.5rem 0;
    input {
      font-size: 0.8rem;
      width: 240px;
      padding: 0.5rem;
      margin: 0;
      &.filled {
        border-color: #f7f7f7;
      }
      &:hover,
      &:active,
      &:focus {
        border-color: #ddd;
      }
    }
  }
`;

const TableContainer = styled.div`
  flex: 1 1 100%;
  overflow-x: hidden;
  overflow-y: auto;
  transition: opacity 0.1s linear;
  table {
    margin-bottom: 4rem;
  }
`;

class JobsPage extends Component {
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
    Meteor.call("jobs.queryCount", { query: {} }, (err, res) => {
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
  _handleRemoveClick = inviteId => ev => {
    ev.preventDefault();
    Meteor.call("invites.remove", { inviteId });
  };
  render() {
    const { intl, jobs, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    console.log(jobs);
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
        <TableContainer>
          <Table compact>
            <thead>
              <tr>
                <th className="fill">
                  <FormattedMessage
                    id="app.admin.jobs.job_type"
                    defaultMessage="Job type"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.repeated"
                    defaultMessage="Repeated"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.status"
                    defaultMessage="Status"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.created"
                    defaultMessage="Created"
                  />
                </th>
              </tr>
            </thead>
            {jobs.map(job => (
              <tbody key={job._id}>
                <tr>
                  <td className="fill small job-type">{job.type}</td>
                  <td>{job.repeated}</td>
                  <td>{job.status}</td>
                  <td className="small">{moment(job.created).format("LLL")}</td>
                </tr>
              </tbody>
            ))}
          </Table>
        </TableContainer>
      </Container>
    );
  }
}

JobsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(JobsPage);
