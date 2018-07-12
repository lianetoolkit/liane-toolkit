import axios from "axios";
import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import styled from "styled-components";

import Map from "/imports/ui/components/mapLayers/Map.jsx";
import PeopleMapLayer from "/imports/ui/components/people/PeopleMapLayer.jsx";

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
  Form,
  Input,
  Select
} from "semantic-ui-react";

export default class MapsPage extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {}
  render() {
    const { loading, layers, campaign, categories, tags, people } = this.props;
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
                  <Grid.Column width="4">
                    {/* <Header>Layers</Header> */}
                    <p>People</p>
                    <p>Audience</p>
                    {layers.map(layer => <p key={layer._id}>{layer.title}</p>)}
                    <Divider />
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
                  <Grid.Column width="12">
                    <Map layers={layers} height="500px">
                      <PeopleMapLayer people={people} />
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
