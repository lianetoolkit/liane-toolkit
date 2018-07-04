import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import { Grid, Segment, Table, Icon, Button, Divider } from "semantic-ui-react";

import moment from "moment";

export default class MapLayersPage extends React.Component {
  static defaultProps = {
    mapLayers: []
  };
  render() {
    const { loading, mapLayers, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Map Layers" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Button
                    as="a"
                    href={FlowRouter.path("App.admin.mapLayers.edit")}
                    floated="right"
                  >
                    <Icon name="plus" />
                    New Map Layer
                  </Button>
                  <Divider hidden clearing />
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell collapsing>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {mapLayers.map(layer => (
                        <Table.Row key={layer._id}>
                          <Table.Cell>{layer.title}</Table.Cell>
                          <Table.Cell collapsing>
                            <Button.Group basic>
                              <Button
                                href={FlowRouter.path(
                                  "App.admin.mapLayers.edit",
                                  {
                                    mapLayerId: layer._id
                                  }
                                )}
                              >
                                Edit
                              </Button>
                            </Button.Group>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          )}
        </section>
      </div>
    );
  }
}
