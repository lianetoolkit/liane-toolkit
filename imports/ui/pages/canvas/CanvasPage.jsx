import axios from "axios";
import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";
import CanvasModel from "/imports/api/canvas/model/canvas";
import FlexDataItem from "/imports/ui/components/flexData/FlexDataItem.jsx";

const canvasUrl = Meteor.settings.public.canvasUrl;

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
  > .flex-data-item {
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
  }
`;

export default class CanvasEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exporting: false
    };
    this._handleExport = this._handleExport.bind(this);
  }
  componentDidMount() {}
  _fieldData(section, field) {
    const { canvas } = this.props;
    return canvas.find(
      fieldData =>
        fieldData.sectionKey == section.key && fieldData.key == field.key
    );
  }
  _handleExport(ev) {
    ev.preventDefault();
    const { campaign } = this.props;
    this.setState({ exporting: true });
    Meteor.call(
      "canvas.getNormalized",
      { campaignId: campaign._id },
      (err, data) => {
        axios
          .post(`${canvasUrl}/api`, {
            canvas: data,
            json: true,
            fromLiane: true
          })
          .then(res => {
            this.setState({ exporting: false });
            if (res.data.id) {
              window.open(`${canvasUrl}/${res.data.id}`);
            } else {
              Alerts.error("Unexpected response from canvas server.");
              // error
            }
          })
          .catch(err => {
            Alerts.error(err);
            this.setState({ exporting: false });
            console.log(err);
          });
      }
    );
  }
  render() {
    const { exporting } = this.state;
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
          {canvasUrl ? (
            <div>
              <Button.Group basic floated="right">
                <Button icon onClick={this._handleExport} disabled={exporting}>
                  <Icon name={exporting ? "spinner" : "print"} />
                  Export canvas
                </Button>
              </Button.Group>
              <Divider hidden clearing />
            </div>
          ) : null}
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
                    primary
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
                      <FlexDataItem
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
