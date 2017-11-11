import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";

import { Form, Grid, Button, Header } from "semantic-ui-react";

import moment from "moment";

export default class CampaignsPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignPage init", { props });
  }

  render() {
    const { loading, campaign } = this.props;
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
                  <Header as="h1">{campaign.name}</Header>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
