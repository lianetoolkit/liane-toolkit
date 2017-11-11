import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Card, Statistic, Grid, Header, Button } from "semantic-ui-react";

import moment from "moment";

export default class AddCampaignPage extends React.Component {
  constructor(props) {
    super(props);
    console.log("AddCampaignPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Add Campaign" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>add campaign form</Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
