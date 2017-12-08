import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import { Grid, Segment, Table, Icon, Button } from "semantic-ui-react";

import moment from "moment";

export default class GeolocationsPage extends React.Component {
  static defaultProps = {
    geolocations: []
  };
  constructor(props) {
    super(props);
    console.log("GeolocationsPage init", { props });
  }
  render() {
    const { loading, geolocations, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Geolocations" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Segment basic clearing>
                    <Button
                      as="a"
                      href={FlowRouter.path(
                        "App.admin.geolocations.edit"
                      )}
                      floated="right"
                    >
                      <Icon name="plus" />
                      New Geolocation
                    </Button>
                  </Segment>
                  <Table fixed>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {geolocations.map(geolocation => (
                        <Table.Row key={geolocation._id}>
                          <Table.Cell>{geolocation.name}</Table.Cell>
                          <Table.Cell collapsing>
                            <a
                              href={FlowRouter.path(
                                "App.admin.geolocations.edit",
                                {
                                  geolocationId: geolocation._id
                                }
                              )}
                            >
                              Edit
                            </a>
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
