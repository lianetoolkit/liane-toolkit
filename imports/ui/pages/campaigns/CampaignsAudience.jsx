import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import AudiencesIndexTable from "/imports/ui/components/audiences/AudiencesIndexTable.jsx";
import AudienceGeolocationSummaryContainer from "/imports/ui/containers/audiences/AudienceGeolocationSummaryContainer.jsx";
import AudienceCategoriesListContainer from "/imports/ui/containers/audiences/AudienceCategoriesListContainer.jsx";
import AudienceCategoryContainer from "/imports/ui/containers/audiences/AudienceCategoryContainer.jsx";
import AudienceGeolocationContainer from "/imports/ui/containers/audiences/AudienceGeolocationContainer.jsx";

import {
  Grid,
  Menu,
  Header,
  List,
  Button,
  Divider,
  Sticky
} from "semantic-ui-react";

export default class CampaignsAudience extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  _getMainGeolocation() {
    const { campaign, geolocations } = this.props;
    if (campaign.context.mainGeolocationId) {
      return geolocations.find(
        location => location._id == campaign.context.mainGeolocationId
      );
    }
    return null;
  }
  _handleContextRef = contextRef => this.setState({ contextRef });
  render() {
    const {
      loading,
      campaign,
      audienceAccount,
      geolocations,
      categoryId,
      geolocationId
    } = this.props;
    const { audienceAccounts } = campaign;

    const { contextRef } = this.state;

    let path = "App.campaignAudience";
    if (categoryId) {
      path += ".category";
    } else if (geolocationId) {
      path += ".geolocation";
    }
    return (
      <div ref={this._handleContextRef}>
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
              {audienceAccounts && audienceAccounts.length ? (
                <Grid.Row style={{ zIndex: 100 }}>
                  <Grid.Column>
                    <Sticky offset={0} context={contextRef}>
                      <Menu>
                        {audienceAccounts.map(acc => (
                          <Menu.Item
                            key={`audienceAccount-${acc.facebookId}`}
                            active={
                              acc.facebookId == audienceAccount.facebookId
                            }
                            href={FlowRouter.path(path, {
                              campaignId: campaign._id,
                              audienceFacebookId: acc.facebookId,
                              categoryId: categoryId,
                              geolocationId: geolocationId
                            })}
                          >
                            {acc.name}
                          </Menu.Item>
                        ))}
                      </Menu>
                    </Sticky>
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              <Grid.Row>
                <Grid.Column>
                  {audienceAccount ? (
                    <div>
                      <AudienceGeolocationSummaryContainer
                        campaignId={campaign._id}
                        facebookAccountId={audienceAccount.facebookId}
                        geolocationId={geolocationId}
                      />
                      <Divider hidden />
                      {categoryId ? (
                        <AudienceCategoryContainer
                          campaignId={campaign._id}
                          facebookAccountId={audienceAccount.facebookId}
                          audienceCategoryId={categoryId}
                        />
                      ) : null}
                      {geolocationId ? (
                        <AudienceGeolocationContainer
                          campaign={campaign}
                          facebookAccount={audienceAccount}
                          geolocationId={geolocationId}
                          geolocations={geolocations}
                        />
                      ) : null}
                      {!categoryId && !geolocationId ? (
                        <AudienceCategoriesListContainer
                          campaignId={campaign._id}
                          facebookAccountId={audienceAccount.facebookId}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <p>
                      No Facebook Account was found.{" "}
                      <a
                        href={FlowRouter.path("App.campaignSettings", {
                          campaignId: campaign._id
                        })}
                      >
                        Go to your settings page and add an Audience Account
                      </a>.
                    </p>
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
