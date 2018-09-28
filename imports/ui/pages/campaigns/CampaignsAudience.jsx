import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import AudienceSummaryContainer from "/imports/ui/containers/audiences/AudienceSummaryContainer.jsx";
import AudienceCategoryContainer from "/imports/ui/containers/audiences/AudienceCategoryContainer.jsx";
import AudienceGeolocationContainer from "/imports/ui/containers/audiences/AudienceGeolocationContainer.jsx";
import AudiencePagesContainer from "/imports/ui/containers/audiences/AudiencePagesContainer.jsx";
import AudienceExploreContainer from "/imports/ui/containers/audiences/AudienceExploreContainer.jsx";
import AccountsMenu from "/imports/ui/components/facebook/AccountsMenu.jsx";

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
  static defaultProps = {
    navTab: "summary"
  };
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
  _handleAccountsClick = (ev, { value }) => {
    const { campaign, navTab } = this.props;
    FlowRouter.go(
      "App.campaignAudience",
      {
        navTab,
        campaignId: campaign._id
      },
      {
        account: value
      }
    );
  };
  _handleExploreAccountsClick = (ev, { value }) => {
    const { categoryId, geolocationId, campaign, navTab } = this.props;
    let path = "App.campaignAudience";
    if (categoryId) {
      path += ".category";
    } else if (geolocationId) {
      path += ".geolocation";
    }
    FlowRouter.go(
      path,
      {
        navTab,
        campaignId: campaign._id,
        categoryId: categoryId,
        geolocationId: geolocationId
      },
      {
        account: value
      }
    );
  };
  render() {
    const {
      loading,
      campaign,
      audienceAccount,
      geolocations,
      categoryId,
      geolocationId,
      audienceCategories,
      audienceCategoryId,
      navTab
    } = this.props;
    const { accounts } = campaign;

    const { contextRef } = this.state;

    let path = "App.campaignAudience";
    if (categoryId) {
      path += ".category";
    } else if (geolocationId) {
      path += ".geolocation";
    }

    let nav = [];

    nav.push({
      name: "Audience Summary",
      active: navTab == "summary",
      href: FlowRouter.path("App.campaignAudience", {
        campaignId: campaign._id,
        navTab: "summary"
      })
    });

    nav.push({
      name: "Places",
      active: navTab == "places",
      href: FlowRouter.path("App.campaignAudience", {
        campaignId: campaign._id,
        navTab: "places"
      })
    });

    if (campaign.accounts.length > 1) {
      nav.push({
        name: "Pages",
        active: navTab == "pages",
        href: FlowRouter.path("App.campaignAudience", {
          campaignId: campaign._id,
          navTab: "pages"
        })
      });
    }

    nav.push({
      name: "Explore",
      active: navTab == "explore",
      href: FlowRouter.path("App.campaignAudience", {
        campaignId: campaign._id,
        navTab: "explore"
      })
    });
    return (
      <div ref={this._handleContextRef}>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Audience"
          nav={nav}
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              {navTab == "summary" ? (
                <>
                  {accounts && accounts.length > 1 ? (
                    <Grid.Row style={{ zIndex: 100 }}>
                      <Grid.Column>
                        <Sticky offset={0} context={contextRef}>
                          <Menu>
                            <AccountsMenu
                              item
                              simple
                              accounts={accounts}
                              onClick={this._handleAccountsClick}
                              selected={audienceAccount.facebookId}
                            />
                          </Menu>
                        </Sticky>
                      </Grid.Column>
                    </Grid.Row>
                  ) : null}
                  <Grid.Row>
                    <Grid.Column>
                      <AudienceSummaryContainer
                        campaign={campaign}
                        facebookAccount={audienceAccount}
                        audienceCategories={audienceCategories}
                        geolocations={geolocations}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </>
              ) : null}
              {navTab == "places" && geolocationId ? (
                <Grid.Row>
                  <Grid.Column>
                    <AudienceGeolocationContainer
                      campaign={campaign}
                      facebookAccount={audienceAccount}
                      audienceCategories={audienceCategories}
                      audienceCategoryId={audienceCategoryId}
                      geolocations={geolocations}
                    />
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              {navTab == "pages" ? (
                <Grid.Row>
                  <Grid.Column>
                    <AudiencePagesContainer
                      campaign={campaign}
                      audienceCategories={audienceCategories}
                      audienceCategoryId={audienceCategoryId}
                    />
                  </Grid.Column>
                </Grid.Row>
              ) : null}
              {navTab == "explore" && geolocationId ? (
                <>
                  {accounts && accounts.length > 1 ? (
                    <Grid.Row style={{ zIndex: 100 }}>
                      <Grid.Column>
                        <Sticky offset={0} context={contextRef}>
                          <Menu>
                            <AccountsMenu
                              item
                              simple
                              accounts={accounts}
                              onClick={this._handleExploreAccountsClick}
                              selected={audienceAccount.facebookId}
                            />
                          </Menu>
                        </Sticky>
                      </Grid.Column>
                    </Grid.Row>
                  ) : null}
                  <Grid.Row>
                    <Grid.Column>
                      <AudienceExploreContainer
                        campaign={campaign}
                        facebookAccount={audienceAccount}
                        geolocationId={geolocationId}
                        geolocations={geolocations}
                      />
                    </Grid.Column>
                  </Grid.Row>
                </>
              ) : null}
              <Grid.Row>
                <Grid.Column>
                  {audienceAccount ? (
                    <div>
                      {categoryId ? (
                        <AudienceCategoryContainer
                          campaignId={campaign._id}
                          facebookAccountId={audienceAccount.facebookId}
                          audienceCategoryId={categoryId}
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
