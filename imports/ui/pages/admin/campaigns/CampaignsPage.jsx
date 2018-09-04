import React from "react";
import PropTypes from "prop-types";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import {
  Grid,
  Segment,
  Table,
  Label,
  Popup,
  Header,
  Icon,
  Button,
  List
} from "semantic-ui-react";

import moment from "moment";

class JobButton extends React.Component {
  constructor(props) {
    super(props);
    this._popupContent = this._popupContent.bind(this);
    this._handleJob = this._handleJob.bind(this);
  }
  _getType() {
    const { type } = this.props;
    switch (type) {
      case "entries":
        return "entries.updateAccountEntries";
      case "audiences":
        return "audiences.updateAccountAudience";
      case "fbUsers":
        return "people.updateFBUsers";
    }
  }
  _getJob() {
    const { campaign, account, type } = this.props;

    return campaign.jobs.find(
      job =>
        (job.data.facebookAccountId == account.facebookId ||
          job.data.facebookId == account.facebookId) &&
        job.type == this._getType()
    );
  }
  _getJobStatus() {
    const job = this._getJob();
    if (!job) {
      return "failed";
    }
    return job.status;
  }
  _getJobIcon() {
    const { campaign, account } = this.props;
    const status = this._getJobStatus();
    switch (status) {
      case "waiting":
        return "clock";
      case "failed":
      case "cancelled":
        return "remove";
      case "running":
        return "play";
      default:
        return "play";
    }
  }
  _handleJob() {
    const { campaign, account, type } = this.props;
    Meteor.call(
      "campaigns.refreshAccountJob",
      {
        campaignId: campaign._id,
        facebookAccountId: account.facebookId,
        type
      },
      error => {
        console.log(error);
      }
    );
  }
  _popupContent() {
    const { account, title } = this.props;
    const job = this._getJob();
    return (
      <div>
        {title ? <Header size="small">{account.name}</Header> : null}
        <p style={{ margin: 0 }}>
          <Label>{job ? job.status : "No job found"}</Label>
        </p>
        {job ? <p>{moment(job.updated).fromNow()}</p> : null}
      </div>
    );
  }
  render() {
    const { campaign, account, children } = this.props;
    return (
      <Popup
        trigger={
          <Button size="tiny" onClick={this._handleJob} icon>
            <Icon name={this._getJobIcon()} /> {children}
          </Button>
        }
        content={this._popupContent()}
      />
    );
  }
}

export default class CampaignsPage extends React.Component {
  static defaultProps = {
    campaigns: []
  };
  constructor(props) {
    super(props);
  }
  _handleRemove = campaignId => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        if (campaignId) {
          Meteor.call("campaigns.remove", { campaignId }, error => {
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Campaign removed successfully");
              this.context.confirmStore.hide();
            }
          });
        }
      }
    });
  };
  _handleSuspend = (campaignId, suspend) => ev => {
    ev.preventDefault();
    this.context.confirmStore.show({
      callback: () => {
        if (campaignId) {
          Meteor.call("campaigns.suspend", { campaignId, suspend }, error => {
            if (error) {
              Alerts.error(error);
            } else {
              Alerts.success("Campaign updated successfully");
              this.context.confirmStore.hide();
            }
          });
        }
      }
    });
  };
  render() {
    const { loading, campaigns, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Campaigns" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Ad Account</Table.HeaderCell>
                        <Table.HeaderCell>Users</Table.HeaderCell>
                        <Table.HeaderCell>Accounts</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {campaigns.map(campaign => (
                        <Table.Row key={campaign._id}>
                          <Table.Cell collapsing verticalAlign="top">
                            <strong>{campaign.name}</strong>
                          </Table.Cell>
                          <Table.Cell collapsing verticalAlign="top">
                            {campaign.adAccountId ? (
                              <Label size="tiny">{campaign.adAccountId}</Label>
                            ) : null}
                          </Table.Cell>
                          <Table.Cell collapsing verticalAlign="top">
                            <List>
                              {campaign.users.map(user => (
                                <List.Item key={user._id}>
                                  {user.name}
                                </List.Item>
                              ))}
                            </List>
                          </Table.Cell>
                          <Table.Cell>
                            <Table basic="very">
                              <Table.Header>
                                <Table.Row>
                                  <Table.HeaderCell>
                                    Account name
                                  </Table.HeaderCell>
                                  <Table.HeaderCell>Jobs</Table.HeaderCell>
                                </Table.Row>
                              </Table.Header>
                              <Table.Body>
                                {campaign.accounts &&
                                  campaign.accounts.map(acc => (
                                    <Table.Row key={acc._id}>
                                      <Table.Cell>{acc.name}</Table.Cell>
                                      <Table.Cell>
                                        <JobButton
                                          campaign={campaign}
                                          account={acc}
                                          type="entries"
                                        >
                                          Entries
                                        </JobButton>
                                        <JobButton
                                          campaign={campaign}
                                          account={acc}
                                          type="fbUsers"
                                        >
                                          Facebook Users
                                        </JobButton>
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                {campaign.audienceAccounts &&
                                  campaign.audienceAccounts.map(acc => (
                                    <Table.Row key={acc.facebookId}>
                                      <Table.Cell>{acc.name}</Table.Cell>
                                      <Table.Cell>
                                        <JobButton
                                          campaign={campaign}
                                          account={acc}
                                          type="audiences"
                                        >
                                          Audience
                                        </JobButton>
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                              </Table.Body>
                            </Table>
                          </Table.Cell>
                          <Table.Cell collapsing verticalAlign="top">
                            <Button.Group size="tiny">
                              {campaign.status == "suspended" ? (
                                <Button
                                  onClick={this._handleSuspend(
                                    campaign._id,
                                    false
                                  )}
                                  icon
                                >
                                  <Icon name="play" /> Activate
                                </Button>
                              ) : (
                                <Button
                                  onClick={this._handleSuspend(
                                    campaign._id,
                                    true
                                  )}
                                  icon
                                >
                                  <Icon name="pause" /> Suspend
                                </Button>
                              )}
                              <Button
                                onClick={this._handleRemove(campaign._id)}
                                negative
                                icon
                              >
                                <Icon name="trash" /> Delete
                              </Button>
                            </Button.Group>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}

CampaignsPage.contextTypes = {
  confirmStore: PropTypes.object
};
