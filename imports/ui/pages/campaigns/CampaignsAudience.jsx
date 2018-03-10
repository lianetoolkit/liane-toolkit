import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import AudiencesIndexTable from "/imports/ui/components/audiences/AudiencesIndexTable.jsx";
import AudienceGeolocationSummaryContainer from "/imports/ui/containers/audiences/AudienceGeolocationSummaryContainer.jsx";
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
      account,
      geolocations,
      categoryId
    } = this.props;
    const { accounts } = campaign;
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
                      {accounts.map(acc => (
                        <Menu.Item
                          key={`account-${acc._id}`}
                          active={
                            acc.facebookId == account.facebookId
                          }
                          href={FlowRouter.path(path, {
                            campaignId: campaign._id,
                            facebookId: acc.facebookId,
                            categoryId: categoryId
                          })}
                        >
                          {acc.name}
                        </Menu.Item>
                      ))}
                    </Menu>
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              <Grid.Row>
                <Grid.Column>
                  {account ? (
                    <div>
                      {categoryId ? (
                        <AudienceCategoryContainer
                          campaignId={campaign._id}
                          facebookAccountId={account.facebookId}
                          audienceCategoryId={categoryId}
                        />
                      ) : (
                        <div>
                          <Header>Geolocations</Header>
                          <AudienceGeolocationSummaryContainer
                            campaignId={campaign._id}
                            facebookAccountId={account.facebookId}
                          />
                          <Divider />
                          <Header>Audience Categories</Header>
                          <AudienceCategoriesListContainer
                            campaignId={campaign._id}
                            facebookAccountId={account.facebookId}
                          />
                        </div>
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
