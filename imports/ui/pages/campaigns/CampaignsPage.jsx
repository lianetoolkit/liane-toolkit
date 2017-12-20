import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import SelectFacebookAccount from "/imports/ui/components/facebook/SelectFacebookAccount.jsx";
import CampaignAccount from "/imports/ui/components/campaigns/CampaignAccount.jsx";
import PeopleTable from "/imports/ui/components/people/PeopleTable.jsx";
import JobsList from "/imports/ui/components/jobs/JobsList.jsx";

import { Grid, Header, List, Button } from "semantic-ui-react";

import moment from "moment";

export default class CampaignsPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignPage init", { props });
    this.state = {
      facebookId: props.facebookId
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.facebookId != this.props.facebookId) {
      this.setState({ facebookId: nextProps.facebookId });
    }
  }

  render() {
    const { loading, campaign, jobs, accounts, accountLists } = this.props;
    const { facebookId } = this.state;
    const facebookAccount = !loading
      ? _.findWhere(accounts, { facebookId: facebookId })
      : null;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            _id: campaign ? campaign._id : ""
          })}
          subTitle={!loading && facebookId ? facebookAccount.name : ""}
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <div>
              {facebookId ? (
                <CampaignAccount
                  campaignId={campaign._id}
                  facebookId={facebookId}
                  contextId={campaign.contextId}
                />
              ) : (
                <Grid>
                  <Grid.Row columns={3}>
                    <Grid.Column>
                      <Header as="h3">Campaign Accounts</Header>
                      {accounts.length ? (
                        <List selection verticalAlign="middle">
                          {accounts.map(account => {
                            return (
                              <List.Item
                                key={account._id}
                                as="a"
                                href={FlowRouter.path(
                                  "App.campaignDetail.account",
                                  {
                                    _id: campaign._id,
                                    facebookId: account.facebookId
                                  }
                                )}
                              >
                                <List.Icon name="facebook square" />
                                <List.Content>
                                  <List.Header>{account.name}</List.Header>
                                  {account.category}
                                </List.Content>
                              </List.Item>
                            );
                          })}
                        </List>
                      ) : (
                        "You do not have associated accounts for this campaign"
                      )}
                    </Grid.Column>
                    <Grid.Column>
                      <SelectFacebookAccount
                        campaignId={campaign._id}
                        selectedAccountsIds={_.pluck(accounts, "facebookId")}
                      />
                    </Grid.Column>
                    <Grid.Column>
                      <Header as="h3">Monitoring Lists</Header>
                      <Button primary content="Create new list" />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column>
                      <PeopleTable
                        selector={{
                          campaignId: campaign._id
                        }}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  {jobs.length ? (
                    <Grid.Row>
                      <Grid.Column>
                        <Header as="h3">Jobs</Header>
                        <JobsList jobs={jobs} />
                      </Grid.Column>
                    </Grid.Row>
                  ) : null}
                </Grid>
              )}
            </div>
          )}
        </section>
      </div>
    );
  }
}
