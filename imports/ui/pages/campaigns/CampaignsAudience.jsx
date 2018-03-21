import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import AudiencesIndexTable from "/imports/ui/components/audiences/AudiencesIndexTable.jsx";
import AudienceGeolocationSummaryContainer from "/imports/ui/containers/audiences/AudienceGeolocationSummaryContainer.jsx";
import AudienceCategoriesListContainer from "/imports/ui/containers/audiences/AudienceCategoriesListContainer.jsx";
import AudienceCategoryContainer from "/imports/ui/containers/audiences/AudienceCategoryContainer.jsx";
import AudienceGeolocationContainer from "/imports/ui/containers/audiences/AudienceGeolocationContainer.jsx";

import { Grid, Menu, Header, List, Button, Divider } from "semantic-ui-react";

export default class CampaignsAudience extends React.Component {
  _getMainGeolocation() {
    const { campaign, geolocations } = this.props;
    if (campaign.context.mainGeolocationId) {
      return geolocations.find(
        location => location._id == campaign.context.mainGeolocationId
      );
    }
    return null;
  }
  render() {
    const {
      loading,
      campaign,
      account,
      geolocations,
      categoryId,
      geolocationId
    } = this.props;
    const { accounts } = campaign;
    let path = "App.campaignAudience";
    if (categoryId) {
      path += ".category";
    } else if (geolocationId) {
      path += ".geolocation";
    }
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Audience - Daily Active Users Estimates"
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
                          active={acc.facebookId == account.facebookId}
                          href={FlowRouter.path(path, {
                            campaignId: campaign._id,
                            facebookId: acc.facebookId,
                            categoryId: categoryId,
                            geolocationId: geolocationId
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
                      <AudienceGeolocationSummaryContainer
                        campaignId={campaign._id}
                        facebookAccountId={account.facebookId}
                        geolocationId={geolocationId}
                      />
                      <Divider hidden />
                      {categoryId ? (
                        <AudienceCategoryContainer
                          campaignId={campaign._id}
                          facebookAccountId={account.facebookId}
                          audienceCategoryId={categoryId}
                        />
                      ) : null}
                      {geolocationId ? (
                        <AudienceGeolocationContainer
                          campaign={campaign}
                          facebookAccount={account}
                          geolocationId={geolocationId}
                          geolocations={geolocations}
                        />
                      ) : null}
                      {!categoryId && !geolocationId ? (
                        <AudienceCategoriesListContainer
                          campaignId={campaign._id}
                          facebookAccountId={account.facebookId}
                        />
                      ) : null}
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
