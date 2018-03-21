import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import { Grid, Segment, Table, Icon, Button, Divider } from "semantic-ui-react";

import moment from "moment";

export default class AudienceCategoriesPage extends React.Component {
  static defaultProps = {
    audienceCategories: []
  };
  render() {
    const { loading, audienceCategories, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Audience Categories" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  <Button
                    as="a"
                    href={FlowRouter.path(
                      "App.admin.audienceCategories.edit"
                    )}
                    floated="right"
                  >
                    <Icon name="plus" />
                    New Audience Category
                  </Button>
                  <Divider hidden clearing />
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.HeaderCell>Interests</Table.HeaderCell>
                        <Table.HeaderCell collapsing>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {audienceCategories.map(audienceCategory => (
                        <Table.Row key={audienceCategory._id}>
                          <Table.Cell>{audienceCategory.title}</Table.Cell>
                          <Table.Cell>
                            {audienceCategory.spec.interests
                              ? audienceCategory.spec.interests
                                  .map(interest => interest.name)
                                  .join(", ")
                              : ""}
                          </Table.Cell>
                          <Table.Cell collapsing>
                            <a
                              href={FlowRouter.path(
                                "App.admin.audienceCategories.edit",
                                {
                                  audienceCategoryId: audienceCategory._id
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
