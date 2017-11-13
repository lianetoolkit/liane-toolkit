import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import SelectFacebookAccount from "/imports/ui/components/facebook/SelectFacebookAccount.jsx";

import { Grid, Header, List } from "semantic-ui-react";

import moment from "moment";

export default class CampaignsPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignPage init", { props });
  }

  render() {
    const { loading, campaign, accounts } = this.props;
    return (
      <div>
        <PageHeader title={`Campaign: ${campaign ? campaign.name : ""}`} />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Header as="h3">Campaign Accounts</Header>
                  {accounts.length ? (
                    <List selection verticalAlign="middle">
                      {accounts.map(account => {
                        return (
                          <List.Item key={account._id}>
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
              </Grid.Row>

              <Grid.Row>
                <Grid.Column>
                  <SelectFacebookAccount
                    campaignId={campaign._id}
                    selectedAccountsIds={_.pluck(accounts, "facebookId")}
                  />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
