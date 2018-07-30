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
        context: false
      }
    };
    this._handleGridItem = this._handleGridItem.bind(this);
  }
  componentDidMount() {
    const { campaignId } = this.props;
    Meteor.call("audiences.campaignSummary", { campaignId }, (err, result) => {
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
          context: value
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
      return [layers.find(l => l._id == layerVisibility.context)];
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
                {/* <Grid.Row>
                  <Grid.Column>
                    <Form>
                      <Form.Group widths="equal">
                        <Form.Field label="Search layers" control={Input} />
                        <Form.Field
                          control={Select}
                          search
                          label="Select a layer category"
                          placeholder="Search categories"
                          options={[
                            {
                              key: "",
                              value: "",
                              text: "All"
                            },
                            ...categories.map(cat => {
                              return {
                                key: cat._id,
                                value: cat._id,
                                text: cat.name
                              };
                            })
                          ]}
                        />
                        <Form.Field
                          control={Select}
                          search
                          multiple
                          label="Select layer tags"
                          placeholder="Search tags"
                          options={tags.map(tag => {
                            return {
                              key: tag._id,
                              value: tag._id,
                              text: tag.name
                            };
                          })}
                        />
                      </Form.Group>
                    </Form>
                  </Grid.Column>
                </Grid.Row> */}
                <Grid.Row>
                  <Grid.Column width="3">
                    <Form>
                      {/* <Header>Layers</Header> */}
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
                          <Form.Field
                            control={Radio}
                            label="None"
                            name="context"
                            value={false}
                            checked={!layerVisibility.context}
                            onChange={this._handleVisibilityChange}
                          />
                          {layers.map(layer => (
                            <Form.Field
                              key={layer._id}
                              control={Radio}
                              label={layer.title}
                              name="context"
                              value={layer._id}
                              checked={layerVisibility.context == layer._id}
                              onChange={this._handleVisibilityChange}
                            />
                          ))}
                          <Divider />
                        </div>
                      ) : null}
                    </Form>
                    {/* <Header size="medium">Categories</Header>
                  <Menu vertical>
                    {categories.map(cat => (
                      <Menu.Item key={cat._id}>{cat.name}</Menu.Item>
                    ))}
                  </Menu>
                  <Header size="medium">Tags</Header>
                  <Menu vertical>
                    {tags.map(tag => (
                      <Menu.Item key={tag._id}>{tag.name}</Menu.Item>
                    ))}
                  </Menu> */}
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
