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

import CopyToClipboard from "/imports/ui2/components/CopyToClipboard.jsx";
import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const jobsLabels = defineMessages({
  "entries.updateAccountEntries": {
    id: "app.jobs.labels.entries.updateAccountEntries",
    defaultMessage: "Facebook Account Entries Update"
  },
  "entries.updateEntryInteractions": {
    id: "app.jobs.labels.entries.updateEntryInteractions",
    defaultMessage: "Facebook Entry Interactions Update"
  },
  "entries.refetchAccountEntries": {
    id: "app.jobs.labels.entries.refetchAccountEntries",
    defaultMessage: "Facebook Account Entries Refetch"
  },
  "campaigns.healthCheck": {
    id: "app.jobs.labels.campaigns.healthCheck",
    defaultMessage: "Facebook Connection Health Check"
  },
  "people.export": {
    id: "app.jobs.labels.people.export",
    defaultMessage: "People Export"
  },
  "people.expireExport": {
    id: "app.jobs.labels.people.expireExport",
    defaultMessage: "Expire People Export"
  },
  "people.importPerson": {
    id: "app.jobs.labels.people.importPerson",
    defaultMessage: "Person import"
  }
});

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  position: relative;
  .id {
    font-family: monospace;
  }
  td.center {
    text-align: center;
    .fa-check {
      float: none;
      margin: 0;
    }
  }
  td.bold {
    font-weight: 600;
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
    }
  }
  a.small {
    display: block;
    width: 100%;
    margin: 0 0 0.5rem;
    color: #63c;
    font-size: 0.7em;
    &.remove {
      color: red;
      border-color: red;
    }
    &:hover {
      color: #fff;
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
  _isJobRemovable(job) {
    return !job.repeats;
    // -- //
    switch (job.type) {
      case "entries.updateAccountEntries":
      case "campaigns.healthCheck":
        return false;
      default:
        return true;
    }
  }
  _isJobRunnable(job) {
    switch (job.status) {
      case "running":
      case "ready":
        return false;
      default:
        return true;
    }
  }
  _handleRunClick = jobId => ev => {
    ev.preventDefault();
    Meteor.call("jobs.ready", { jobId });
  };
  _handleRemoveClick = jobId => ev => {
    ev.preventDefault();
    Meteor.call("jobs.removeJobs", { jobIds: [jobId] });
  };
  render() {
    const { intl, jobs, page, limit } = this.props;
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
        >
          {/* <input type="text" /> */}
        </PagePaging>
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
                    id="app.admin.jobs.repeatable"
                    defaultMessage="Repeatable"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.campaign"
                    defaultMessage="Campaign"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.repeated"
                    defaultMessage="# Executed"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.status"
                    defaultMessage="Status"
                  />
                </th>
                <th />
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.created"
                    defaultMessage="Created"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="app.admin.jobs.next"
                    defaultMessage="Next"
                  />
                </th>
              </tr>
            </thead>
            {jobs.map(job => (
              <tbody key={job._id}>
                <tr>
                  <td className="fill small job-type">
                    {intl.formatMessage(jobsLabels[job.type])}
                  </td>
                  <td className="center">
                    {job.repeats ? <FontAwesomeIcon icon="check" /> : null}
                  </td>
                  <td className="small id">
                    {job.data.campaignId ? job.data.campaignId : "--"}
                  </td>
                  <td>{job.repeated}</td>
                  <td>{job.status}</td>
                  <td>
                    {this._isJobRunnable(job) ? (
                      <Button
                        className="small"
                        onClick={this._handleRunClick(job._id)}
                      >
                        <FormattedMessage
                          id="app.admin.jobs.restart_job"
                          defaultMessage="Run now"
                        />
                      </Button>
                    ) : null}
                    {this._isJobRemovable(job) ? (
                      <Button
                        className="small remove"
                        onClick={this._handleRemoveClick(job._id)}
                      >
                        <FormattedMessage
                          id="app.admin.jobs.remove_job"
                          defaultMessage="Remove"
                        />
                      </Button>
                    ) : null}
                  </td>
                  <td className="small">{moment(job.created).format("LLL")}</td>
                  <td className="bold">
                    {job.after ? moment(job.after).fromNow() : "--"}
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

JobsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(JobsPage);
