import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import { Grid, Segment, Table, Icon, Button } from "semantic-ui-react";

import moment from "moment";

export default class ContextsPage extends React.Component {
  static defaultProps = {
    contexts: []
  };
  constructor(props) {
    super(props);
    console.log("ContextsPage init", { props });
  }
  render() {
    const { loading, contexts, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Contexts" />
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
                      href={FlowRouter.path("App.admin.contexts.edit")}
                      floated="right"
                    >
                      <Icon name="plus" />
                      New context
                    </Button>
                  </Segment>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Locations</Table.HeaderCell>
                        <Table.HeaderCell>Audience Categories</Table.HeaderCell>
                        <Table.HeaderCell>Campaigns</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {contexts.map(context => (
                        <Table.Row key={context._id}>
                          <Table.Cell>{context.name}</Table.Cell>
                          <Table.Cell>
                            {context.mainGeolocation
                              ? context.mainGeolocation.name
                              : ""}
                            {context.geolocations.length
                              ? ` +${context.geolocations.length} location(s)`
                              : ""}
                          </Table.Cell>
                          <Table.Cell>
                            {context.audienceCategories
                              ? context.audienceCategories
                                  .map(
                                    audienceCategory => audienceCategory.title
                                  )
                                  .join(", ")
                              : ""}
                          </Table.Cell>
                          <Table.Cell>
                            {context.campaigns.length} campaign(s)
                          </Table.Cell>
                          <Table.Cell>
                            <a
                              href={FlowRouter.path("App.admin.contexts.edit", {
                                contextId: context._id
                              })}
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
