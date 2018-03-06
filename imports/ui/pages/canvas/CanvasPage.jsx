import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import Alerts from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import CanvasModel from "/imports/api/canvas/model/canvas";
import CanvasItem from "/imports/ui/components/canvas/CanvasItem.jsx";

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

const CanvasItems = styled.div`
  > .canvas-item {
    width: 33.3333%;
    float: left;
    box-sizing: border-box;
    padding-right: 2rem;
    &.group,
    &.repeater {
      width: auto;
      float: none;
      padding-right: 0;
      &:before,
      &:after {
        content: "";
        clear: both;
        display: table;
      }
  }
`;

export default class CanvasEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    console.log("CanvasPage init", { props });
  }
  componentDidMount() {}
  _fieldData(section, field) {
    const { canvas } = this.props;
    return canvas.find(
      fieldData =>
        fieldData.sectionKey == section.key && fieldData.key == field.key
    );
  }
  render() {
    const { loading, campaign, canvas } = this.props;
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
            <Segment.Group>
              {CanvasModel.map(section => (
                <Segment key={section.key} clearing>
                  <Header as="h2" floated="left">
                    {section.title}
                  </Header>
                  <Button
                    as="a"
                    basic
                    floated="right"
                    href={FlowRouter.path("App.campaignCanvas.edit", {
                      campaignId: campaign._id,
                      sectionKey: section.key
                    })}
                  >
                    <Icon name="edit" />
                    Edit information
                  </Button>
                  <Divider clearing hidden />
                  <CanvasItems>
                    {section.fields.map(field => (
                      <CanvasItem
                        key={field.key}
                        field={field}
                        data={this._fieldData(section, field)}
                      />
                    ))}
                  </CanvasItems>
                </Segment>
              ))}
            </Segment.Group>
          )}
        </section>
      </div>
    );
  }
}
