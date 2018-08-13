import axios from "axios";
import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";

import Map from "/imports/ui/components/mapLayers/Map.jsx";
import PeopleMapLayer from "/imports/ui/components/people/PeopleMapLayer.jsx";
import AudienceLayer from "/imports/ui/components/mapLayers/AudienceLayer.jsx";

import { compact } from "lodash";

const Wrapper = styled.div`
  .ui.form {
    position: relative;
    z-index: 9999;
  }
`;

import {
  Segment,
  Icon,
  Step,
  Rail,
  Sticky,
  Menu,
  Divider,
  Grid,
  Header,
  List,
  Button,
  Radio,
  Checkbox,
  Form,
  Input,
  Select
} from "semantic-ui-react";

export default class MapsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      bounds: [],
      layerVisibility: {
        people: true,
        audience: true,
        context: {}
      }
    };
    this._handleGridItem = this._handleGridItem.bind(this);
  }
  componentDidMount() {
    const { campaignId } = this.props;
    Meteor.call("audiences.map", { campaignId }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          audience: result
        });
      }
    });
  }
  _handleGridItem(grid) {
    this.setState({ grid });
  }
  _handleBounds = index => layerBounds => {
    const { bounds } = this.state;
    const newBounds = [...bounds];
    newBounds[index] = layerBounds;
    this.setState({
      bounds: compact(newBounds)
    });
  };
  _handleVisibilityChange = (ev, { name, value, checked }) => {
    const { layerVisibility } = this.state;
    if (name == "context") {
      this.setState({
        layerVisibility: {
          ...layerVisibility,
          context: {
            ...layerVisibility.context,
            [value]: !!checked
          }
        }
      });
    } else {
      this.setState({
        grid: [],
        layerVisibility: {
          ...layerVisibility,
          [name]: !!checked
        }
      });
    }
  };
  _layers = () => {
    const { layers } = this.props;
    const { layerVisibility } = this.state;
    if (layerVisibility.context) {
      return layers.filter(l => layerVisibility.context[l._id]);
    }
    return [];
  };
  render() {
    const { loading, layers, campaign, categories, tags, people } = this.props;
    const { layerVisibility, audience, grid, bounds } = this.state;
    const contextLayers = this._layers();
    return (
      <div>
        <PageHeader
          title={`Campaign: ${campaign ? campaign.name : ""}`}
          titleTo={FlowRouter.path("App.campaignDetail", {
            campaignId: campaign ? campaign._id : ""
          })}
          subTitle="Campaign Map"
        />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Wrapper>
              <Grid>
                <Grid.Row>
                  <Grid.Column width="3">
                    <Form>
                      <Form.Field
                        control={Checkbox}
                        label="People"
                        name="people"
                        checked={layerVisibility.people}
                        onChange={this._handleVisibilityChange}
                      />
                      <Form.Field
                        control={Checkbox}
                        label="Audience"
                        name="audience"
                        checked={layerVisibility.audience}
                        onChange={this._handleVisibilityChange}
                      />
                      <Divider />
                      {layers && layers.length ? (
                        <div>
                          <Header as="h4">Context layers</Header>
                          {layers.map(layer => (
                            <Form.Field
                              key={layer._id}
                              control={Checkbox}
                              label={layer.title}
                              name="context"
                              value={layer._id}
                              checked={layerVisibility.context[layer._id]}
                              onChange={this._handleVisibilityChange}
                            />
                          ))}
                          <Divider />
                        </div>
                      ) : null}
                    </Form>
                  </Grid.Column>
                  <Grid.Column width="13">
                    <Map
                      layers={contextLayers}
                      defaultGrid={grid}
                      defaultBounds={bounds}
                      height="600px"
                    >
                      {layerVisibility.people ? (
                        <PeopleMapLayer
                          people={people}
                          onBounds={this._handleBounds(0)}
                        />
                      ) : null}
                      {layerVisibility.audience ? (
                        <AudienceLayer
                          audience={audience}
                          onGrid={this._handleGridItem}
                          onBounds={this._handleBounds(1)}
                        />
                      ) : null}
                    </Map>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Wrapper>
          )}
        </section>
      </div>
    );
  }
}
