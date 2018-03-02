import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import AuthFacebook from "/imports/ui/components/facebook/AuthFacebook.jsx";
import CampaignsListContainer from "/imports/ui/containers/campaigns/CampaignsListContainer.jsx";

import { Card, Statistic, Grid, Header, Button } from "semantic-ui-react";

import moment from "moment";

export default class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("DashboardPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
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
                    <CampaignsListContainer />
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
