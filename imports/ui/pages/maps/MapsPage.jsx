import axios from "axios";
import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";

import {
  Segment,
  Icon,
  Step,
  Rail,
  Sticky,
  Divider,
  Grid,
  Header,
  List,
  Button
} from "semantic-ui-react";

export default class MapsPage extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() {
    const { loading, campaign } = this.props;
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Maps"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <p />
          )}
        </section>
      </div>
    );
  }
}
