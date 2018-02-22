import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import AudiencesIndexTable from "/imports/ui/components/audiences/AudiencesIndexTable.jsx";
import AudienceCategoriesListContainer from "/imports/ui/containers/audiences/AudienceCategoriesListContainer.jsx";
import AudienceCategoryContainer from "/imports/ui/containers/audiences/AudienceCategoryContainer.jsx";

import { Grid, Menu, Header, List, Button, Divider } from "semantic-ui-react";

export default class CampaignsAudience extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignsAudience init", { props });
  }
  render() {
    const {
      loading,
      campaign,
      geolocations,
      accounts,
      facebookId,
      categoryId
    } = this.props;
    console.log(geolocations);
    let facebookAccount;
    if (!loading) {
      if (facebookId) {
        facebookAccount = !loading
          ? _.findWhere(accounts, { facebookId: facebookId })
          : null;
      } else {
        facebookAccount = accounts[0];
      }
    }
    const path = categoryId
      ? "App.campaignAudience.category"
      : "App.campaignAudience";
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Audience"
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
                      {accounts.map(account => (
                        <Menu.Item
                          key={`account-${account._id}`}
                          active={
                            account.facebookId == facebookAccount.facebookId
                          }
                          href={FlowRouter.path(path, {
                            campaignId: campaign._id,
                            facebookId: account.facebookId,
                            categoryId: categoryId
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
                  {facebookAccount ? (
                    <div>
                      {categoryId ? (
                        <AudienceCategoryContainer
                          campaignId={campaign._id}
                          facebookAccountId={facebookAccount.facebookId}
                          audienceCategoryId={categoryId}
                        />
                      ) : (
                        <AudienceCategoriesListContainer
                          campaignId={campaign._id}
                          facebookAccountId={facebookAccount.facebookId}
                        />
                      )}
                    </div>
                  ) : (
                    <p>No Facebook Account was found</p>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
