import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import PeopleTable from "/imports/ui/components/people/PeopleTable.jsx";

import { Grid, Header, Menu, List, Button } from "semantic-ui-react";

export default class CampaignsPeople extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignsPeople init", { props });
  }
  render() {
    const { loading, campaign, accounts, facebookId } = this.props;
    let facebookAccount, selector;
    if (!loading) {
      selector = {
        campaignId: campaign._id
      };
      if (facebookId) {
        selector.facebookAccounts = { $in: [facebookId] };
        facebookAccount = !loading
          ? _.findWhere(accounts, { facebookId: facebookId })
          : null;
      }
    }
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="People"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              {accounts.length ? (
                <Grid.Row>
                  <Grid.Column>
                    <Menu>
                      <Menu.Item
                        active={!facebookAccount}
                        href={FlowRouter.path("App.campaignPeople", {
                          campaignId: campaign._id
                        })}
                      >
                        All people
                      </Menu.Item>
                      {accounts.map(account => (
                        <Menu.Item
                          key={`account-${account._id}`}
                          active={
                            facebookAccount &&
                            account.facebookId == facebookAccount.facebookId
                          }
                          href={FlowRouter.path("App.campaignPeople", {
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
                  <PeopleTable
                    facebookAccount={facebookId || null}
                    selector={selector}
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
