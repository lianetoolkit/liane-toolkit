import React from "react";
import { Table, Button, Icon, Header } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import moment from "moment";

export default class JobsList extends React.Component {
  constructor(props) {
    super(props);
    this._handleAction = this._handleAction.bind(this);
  }
  _handleAction(action, jobId) {
    return () => {
      Meteor.call(`jobs.${action}`, { jobId }, error => {
        if (error) {
          Alerts.error(error);
        }
      });
    };
  }
  _getJobName(job) {
    if (job.type.indexOf("audiences") !== -1) {
      return "Audience";
    } else if (job.type.indexOf("entries") !== -1) {
      return "Entries";
    }
  }
  _getButtonDisabled(job) {
    return job.status == "ready";
  }
  _getButtonName(job) {
    switch (job.status) {
      case "running":
        return "cancel";
      case "waiting":
      case "failed":
      case "cancelled":
        return "play";
      default:
        return "clock";
    }
  }
  _getButtonAction(job) {
    switch (job.status) {
      case "running":
        return "cancel";
      case "waiting":
        return "ready";
      case "failed":
      case "cancelled":
        return "restart";
      default:
        return "";
    }
  }
  render() {
    const { jobs } = this.props;
    if (jobs.length) {
      return (
        <Table celled>
          <Table.Body>
            {jobs.map(job => (
              <Table.Row key={job._id}>
                <Table.Cell>
                  <Header as="h4">
                    <Icon name="tasks" /> {this._getJobName(job)}
                  </Header>
                </Table.Cell>
                <Table.Cell>
                  Last run {moment(job.updated).fromNow()}, next run{" "}
                  {moment(job.after).fromNow()}
                </Table.Cell>
                <Table.Cell collapsing>Ran {job.repeated} time(s)</Table.Cell>
                <Table.Cell collapsing>Currently {job.status}</Table.Cell>
                <Table.Cell collapsing>
                  <Button
                    attached
                    icon
                    disabled={this._getButtonDisabled(job)}
                    onClick={this._handleAction(
                      this._getButtonAction(job),
                      job._id
                    )}
                  >
                    <Icon name={this._getButtonName(job)} />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      );
    } else {
      return null;
    }
  }
}
