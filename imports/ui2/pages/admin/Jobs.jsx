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
import Select from "react-select";

import { modalStore } from "/imports/ui2/containers/Modal.jsx";

import CampaignSelect from "/imports/ui2/components/CampaignSelect.jsx";
import CopyToClipboard from "/imports/ui2/components/CopyToClipboard.jsx";
import Table from "/imports/ui2/components/Table.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import PagePaging from "/imports/ui2/components/PagePaging.jsx";

const messages = defineMessages({
  filterType: {
    id: "app.admin.jobs.filter.type",
    defaultMessage: "Job type...",
  },
  filterStatus: {
    id: "app.admin.jobs.filter.status",
    defaultMessage: "Job status...",
  },
  filterCampaign: {
    id: "app.admin.jobs.filter.campaign",
    defaultMessage: "Campaign...",
  },
  filterListCampaign: {
    id: "app.admin.jobs.filter.campaign_from_list",
    defaultMessage: "Filter jobs from this campaign",
  },
});

const jobsLabels = defineMessages({
  "entries.updateAccountEntries": {
    id: "app.jobs.labels.entries.updateAccountEntries",
    defaultMessage: "Facebook Account Entries Update",
  },
  "entries.updateEntryInteractions": {
    id: "app.jobs.labels.entries.updateEntryInteractions",
    defaultMessage: "Facebook Entry Interactions Update",
  },
  "entries.refetchAccountEntries": {
    id: "app.jobs.labels.entries.refetchAccountEntries",
    defaultMessage: "Facebook Account Entries Refetch",
  },
  "campaigns.healthCheck": {
    id: "app.jobs.labels.campaigns.healthCheck",
    defaultMessage: "Facebook Connection Health Check",
  },
  "people.export": {
    id: "app.jobs.labels.people.export",
    defaultMessage: "People Export",
  },
  "people.expireExport": {
    id: "app.jobs.labels.people.expireExport",
    defaultMessage: "Expire People Export",
  },
  "people.import": {
    id: "app.jobs.labels.people.import",
    defaultMessage: "Import",
  },
  "people.importPerson": {
    id: "app.jobs.labels.people.importPerson",
    defaultMessage: "Person import",
  },
  "emails.sendMail": {
    id: "app.jobs.labels.emails.sendMail",
    defaultMessage: "Email",
  },
});

const statusLabels = defineMessages({
  waiting: {
    id: "app.jobs.status.waiting",
    defaultMessage: "Waiting",
  },
  ready: {
    id: "app.jobs.status.ready",
    defaultMessage: "Ready",
  },
  running: {
    id: "app.jobs.status.running",
    defaultMessage: "Running",
  },
  failed: {
    id: "app.jobs.status.failed",
    defaultMessage: "Failed",
  },
  paused: {
    id: "app.jobs.status.paused",
    defaultMessage: "Paused",
  },
  cancelled: {
    id: "app.jobs.status.cancelled",
    defaultMessage: "Cancelled",
  },
  completed: {
    id: "app.jobs.status.completed",
    defaultMessage: "Completed",
  },
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

const Filters = styled.div`
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
    &:last-child {
      border: 0;
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
      count: 0,
      filters: {},
    };
  }
  componentDidUpdate(prevProps) {}
  componentDidMount() {
    const { query } = this.props;
    this.setState({ loadingCount: true });
    Meteor.call("jobs.queryCount", { query }, (err, res) => {
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
      case "failed":
        return false;
      default:
        return true;
    }
  }
  _handleRunClick = (jobId) => (ev) => {
    ev.preventDefault();
    Meteor.call("jobs.ready", { jobId });
  };
  _handleRestartClick = (jobId) => (ev) => {
    ev.preventDefault();
    Meteor.call("jobs.restartJobs", { jobIds: [jobId] });
  };
  _handleRemoveClick = (jobId) => (ev) => {
    ev.preventDefault();
    Meteor.call("jobs.removeJobs", { jobIds: [jobId] });
  };
  _getJobTypesOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (let key in jobsLabels) {
      options.push({
        value: key,
        label: intl.formatMessage(jobsLabels[key]),
      });
    }
    return options;
  };
  _getJobStatusOptions = () => {
    const { intl } = this.props;
    let options = [];
    for (let key in statusLabels) {
      options.push({
        value: key,
        label: intl.formatMessage(statusLabels[key]),
      });
    }
    return options;
  };
  _handleFilterChange = ({ target }) => {
    let value = target.value;
    if (Array.isArray(target.value)) {
      value = target.value.join(",");
    }
    FlowRouter.setQueryParams({ [target.name]: value, page: 1 });
  };
  _handleFilterSelectChange = (name) => (ev) => {
    let value = ev && ev.value ? ev.value : undefined;
    if (Array.isArray(value)) {
      value = value.join(",");
    }
    FlowRouter.setQueryParams({ [name]: value, page: 1 });
  };
  _buildFilterTypeValue = () => {
    const value = FlowRouter.getQueryParam("type");
    if (!value) return undefined;
    return this._getJobTypesOptions().find((option) => option.value == value);
  };
  _buildFilterStatusValue = () => {
    const value = FlowRouter.getQueryParam("status");
    if (!value) return undefined;
    return this._getJobStatusOptions().find((option) => option.value == value);
  };
  _handleCampaignClick = (campaignId) => (ev) => {
    ev.preventDefault();
    FlowRouter.setQueryParams({ campaign: campaignId });
  };
  _getCampaignValue = () => {
    const value = FlowRouter.getQueryParam("campaign") || "";
    if (value) {
      if (!Array.isArray(value)) {
        return value.split(",");
      } else {
        return value;
      }
    }
    return null;
  };
  render() {
    const { intl, jobs, page, limit } = this.props;
    const { loadingCount, count } = this.state;
    return (
      <Container>
        <Filters>
          <div>
            <Select
              classNamePrefix="select-search"
              cacheOptions
              isClearable={true}
              isSearchable={true}
              placeholder={intl.formatMessage(messages.filterType)}
              options={this._getJobTypesOptions()}
              onChange={this._handleFilterSelectChange("type")}
              value={this._buildFilterTypeValue()}
            />
          </div>
          <div>
            <Select
              classNamePrefix="select-search"
              cacheOptions
              isClearable={true}
              isSearchable={true}
              placeholder={intl.formatMessage(messages.filterStatus)}
              options={this._getJobStatusOptions()}
              onChange={this._handleFilterSelectChange("status")}
              value={this._buildFilterStatusValue()}
            />
          </div>
          <div>
            <CampaignSelect
              onChange={this._handleFilterChange}
              placeholder={intl.formatMessage(messages.filterCampaign)}
              value={this._getCampaignValue()}
              name="campaign"
              multiple={false}
            />
          </div>
        </Filters>
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
            {jobs.map((job) => (
              <tbody key={job._id}>
                <tr>
                  <td className="fill small job-type">
                    {intl.formatMessage(jobsLabels[job.type])}
                  </td>
                  <td className="center">
                    {job.repeats ? <FontAwesomeIcon icon="check" /> : null}
                  </td>
                  <td className="small id">
                    {job.data.campaignId ? (
                      <a
                        data-tip={intl.formatMessage(
                          messages.filterListCampaign
                        )}
                        data-for={`job-campaign-${job._id}`}
                        href="javacript:void(0);"
                        onClick={this._handleCampaignClick(job.data.campaignId)}
                      >
                        {job.data.campaignId}
                      </a>
                    ) : (
                      "--"
                    )}
                    <ReactTooltip
                      id={`job-campaign-${job._id}`}
                      effect="solid"
                    />
                  </td>
                  <td>{job.repeated}</td>
                  <td>
                    {job.status == "failed" ? (
                      <span
                        data-for={`job-status-${job._id}`}
                        data-tip={job.failures[job.failures.length - 1].value}
                      >
                        {intl.formatMessage(statusLabels[job.status])}
                      </span>
                    ) : (
                      intl.formatMessage(statusLabels[job.status])
                    )}
                    <ReactTooltip id={`job-status-${job._id}`} effect="solid" />
                  </td>
                  <td>
                    {job.status == "failed" ? (
                      <Button
                        className="small"
                        onClick={this._handleRestartClick(job._id)}
                      >
                        <FormattedMessage
                          id="app.admin.jobs.try_again"
                          defaultMessage="Try again"
                        />
                      </Button>
                    ) : null}
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
  intl: intlShape.isRequired,
};

export default injectIntl(JobsPage);
