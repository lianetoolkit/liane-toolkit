import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import CanvasConfig from "/imports/api/canvas/canvasForm.json";
import CanvasForm from "/imports/ui/components/canvas/CanvasForm.jsx";

import { Step, Divider, Grid, Header, List, Button } from "semantic-ui-react";

const Wrapper = styled.div`
  .ui.ordered.steps .step:before {
    font-size: 1em;
  }
`;

const Description = styled.p`
  font-size: 1.2em;
  margin: 1rem 0;
  padding: 1rem 0;
  border-bottom: 1px solid #eee;
`;

export default class CanvasEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionKey: null
    };
    console.log("CanvasEdit init", { props });
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentDidMount() {
    const sectionKey = this.props.sectionKey || CanvasConfig[0].key;
    this.setState({
      sectionKey
    });
  }
  componentWillReceiveProps(nextProps) {
    const { sectionKey } = this.props;
    if (nextProps.sectionKey !== sectionKey) {
      this.setState({
        sectionKey: nextProps.sectionKey || CanvasConfig[0].key
      });
    }
  }
  _handleSubmit(data) {
    const { campaignId } = this.props;
    const { sectionKey } = this.state;
    // console.log(data);
    Meteor.call(
      "canvas.formUpdate",
      {
        campaignId,
        sectionKey,
        data
      },
      (error, result) => {
        console.log(result);
      }
    );
  }
  render() {
    const { sectionKey } = this.state;
    const { loading, campaign, canvas } = this.props;
    const section = CanvasConfig.find(section => section.key == sectionKey);
    return (
      <Wrapper>
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
                {sectionKey && section ? (
                  <Grid.Column width={11}>
                    <Description>{section.description}</Description>
                    <CanvasForm
                      config={section}
                      canvas={canvas}
                      onSubmit={this._handleSubmit}
                    />
                  </Grid.Column>
                ) : null}
              </Grid.Row>
            </Grid>
          )}
        </section>
      </Wrapper>
    );
  }
}
