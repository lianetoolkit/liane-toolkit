import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import {
  Grid,
  Segment,
  Table,
  Label,
  Popup,
  Header,
  Icon,
  Button
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
    const { account } = this.props;
    const job = this._getJob();
    return (
      <div>
        <Header size="small">{account.name}</Header>
        <p>
          <Label>{job ? job.status : "No job found"}</Label>
        </p>
        {job ? <p>{moment(job.updated).fromNow()}</p> : null}
      </div>
    );
  }
  render() {
    const { campaign, account } = this.props;
    return (
      <Popup
        trigger={
          <Button size="tiny" onClick={this._handleJob} icon>
            <Icon name={this._getJobIcon()} />
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
    console.log("CampaignsPage init", { props });
  }
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
                        <Table.HeaderCell>Accounts</Table.HeaderCell>
                        <Table.HeaderCell collapsing>
                          Entries jobs
                        </Table.HeaderCell>
                        <Table.HeaderCell collapsing>
                          Audience jobs
                        </Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {campaigns.map(campaign => (
                        <Table.Row key={campaign._id}>
                          <Table.Cell>
                            <strong>{campaign.name}</strong>
                          </Table.Cell>
                          <Table.Cell>
                            {campaign.adAccountId ? (
                              <Label size="tiny">{campaign.adAccountId}</Label>
                            ) : null}
                          </Table.Cell>
                          <Table.Cell>
                            {campaign.accounts.map(acc => acc.name).join(", ")}
                          </Table.Cell>
                          <Table.Cell collapsing>
                            {campaign.accounts ? (
                              <div>
                                {campaign.accounts.map(account => (
                                  <JobButton
                                    key={account.facebookId}
                                    campaign={campaign}
                                    account={account}
                                    type="entries"
                                  />
                                ))}
                              </div>
                            ) : (
                              "No accounts"
                            )}
                          </Table.Cell>
                          <Table.Cell collapsing>
                            {campaign.accounts ? (
                              <div>
                                {campaign.accounts.map(account => (
                                  <JobButton
                                    key={account.facebookId}
                                    campaign={campaign}
                                    account={account}
                                    type="audiences"
                                  />
                                ))}
                              </div>
                            ) : (
                              "No accounts"
                            )}
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
