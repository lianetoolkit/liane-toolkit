import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import CanvasConfig from "/imports/api/canvas/canvasForm.json";
import CanvasForm from "/imports/ui/components/canvas/CanvasForm.jsx";

import { Step, Divider, Grid, Header, List, Button } from "semantic-ui-react";

const Description = styled.p`
  font-size: 1.2em;
  margin: 1rem 0;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
`;

export default class CanvasEdit extends React.Component {
  constructor(props) {
    super(props);
    console.log("CanvasEdit init", { props });
  }
  render() {
    const { loading, campaign } = this.props;
    const sectionKey = this.props.sectionKey || CanvasConfig[0].key;
    const section = CanvasConfig.find(section => section.key == sectionKey);
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Canvas"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid columns={2}>
              <Grid.Row>
                <Grid.Column width={5}>
                  <Step.Group fluid ordered vertical size="mini">
                    {CanvasConfig.map(section => (
                      <Step
                        key={section.key}
                        active={sectionKey == section.key}
                        href={FlowRouter.path("App.campaignCanvas.edit", {
                          sectionKey: section.key,
                          campaignId: campaign._id
                        })}
                      >
                        <Step.Content>
                          <Step.Title>{section.title}</Step.Title>
                        </Step.Content>
                      </Step>
                    ))}
                  </Step.Group>
                </Grid.Column>
                <Grid.Column width={11}>
                  <Description>{section.description}</Description>
                  <CanvasForm config={section} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
