import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import EntriesTable from "/imports/ui/components/entries/EntriesTable.jsx";

import { Grid, Header, Menu, List, Button } from "semantic-ui-react";

export default class CampaignsEntries extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, campaign, facebookId } = this.props;
    const { accounts } = campaign;
    let facebookAccount, selector;
    if (!loading) {
      if (facebookId) {
        selector = {
          facebookAccountId: facebookId
        };
        facebookAccount = !loading
          ? _.findWhere(accounts, { facebookId: facebookId })
          : null;
      } else {
        selector = {
          facebookAccountId: { $in: accounts.map(a => a.facebookId) }
        };
      }
    }
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Facebook Posts"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              {accounts.length > 1 ? (
                <Grid.Row>
                  <Grid.Column>
                    <Menu>
                      <Menu.Item
                        active={!facebookAccount}
                        href={FlowRouter.path("App.campaignEntries", {
                          campaignId: campaign._id
                        })}
                      >
                        All entries
                      </Menu.Item>
                      {accounts.map(account => (
                        <Menu.Item
                          key={`account-${account._id}`}
                          active={
                            facebookAccount &&
                            account.facebookId == facebookAccount.facebookId
                          }
                          href={FlowRouter.path("App.campaignEntries", {
                            campaignId: campaign._id,
                            facebookId: account.facebookId
                          })}
                        >
                          {account.name}
                        </Menu.Item>
                      ))}
                    </Menu>
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              <Grid.Row>
                <Grid.Column>
                  <EntriesTable selector={selector} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
