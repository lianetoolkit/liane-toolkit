import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import CanvasModel from "/imports/api/canvas/model/canvas";
import CanvasForm from "/imports/ui/components/canvas/CanvasForm.jsx";

import {
  Step,
  Rail,
  Sticky,
  Divider,
  Grid,
  Header,
  List,
  Button
} from "semantic-ui-react";

const Wrapper = styled.div`
  .ui.ordered.steps .step:before {
    font-size: 1em;
  }
`;

const Description = styled.div`
  font-size: 1.2em;
  line-height: 1.7em;
  margin: 0 0 2rem 0;
  padding: 1rem 0 2rem 0;
  border-bottom: 1px solid #eee;
  p {
    margin: 0 0 .5rem;
  }
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
    const sectionKey = this.props.sectionKey || CanvasModel[0].key;
    this.setState({
      sectionKey
    });
  }
  componentWillReceiveProps(nextProps) {
    const { sectionKey } = this.props;
    if (nextProps.sectionKey !== sectionKey) {
      this.setState({
        sectionKey: nextProps.sectionKey || CanvasModel[0].key
      });
    }
  }
  _handleContextRef = contextRef => this.setState({ contextRef });
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
    const { sectionKey, contextRef } = this.state;
    const { loading, campaign, canvas } = this.props;
    const section = CanvasModel.find(section => section.key == sectionKey);
    return (
      <Wrapper>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Editing your canvas"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid columns={2}>
              <Grid.Row>
                <Grid.Column width={5}>
                  <div className="test">
                    <Sticky
                      pushing
                      offset={20}
                      context={contextRef}
                      scrollContext={document.getElementById("app-content")}
                    >
                      <Step.Group fluid ordered vertical size="mini">
                        {CanvasModel.map(section => (
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
                    </Sticky>
                  </div>
                </Grid.Column>
                {sectionKey && section ? (
                  <Grid.Column width={11}>
                    <div ref={this._handleContextRef}>
                      <Description
                        dangerouslySetInnerHTML={{
                          __html: section.description
                        }}
                      />
                      <CanvasForm
                        config={section}
                        canvas={canvas}
                        onSubmit={this._handleSubmit}
                      />
                    </div>
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
