import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AuthFacebook from "/imports/ui/components/facebook/AuthFacebook.jsx";
import CampaignsList from "/imports/ui/components/campaigns/CampaignsList.jsx";

import { Card, Statistic, Grid, Header, Button } from "semantic-ui-react";

import moment from "moment";

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { loading, currentUser, campaigns } = this.props;
    return (
      <div>
        <PageHeader title="Dashboard" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  {currentUser.services.facebook ? (
                    <CampaignsList
                      currentUser={currentUser}
                      campaigns={campaigns}
                    />
                  ) : (
                    <AuthFacebook />
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
