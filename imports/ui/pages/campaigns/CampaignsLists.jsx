import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";

import { Grid, Header, List, Button } from "semantic-ui-react";

export default class CampaignsLists extends React.Component {
  constructor(props) {
    super(props);
    console.log("CampaignsLists init", { props });
  }
  render() {
    const { loading, campaign } = this.props;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Monitoring Lists"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid />
          )}
        </section>
      </div>
    );
  }
}
