import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import { Grid, Segment, Table, Icon, Button, Divider } from "semantic-ui-react";

import moment from "moment";

export default class UsersPage extends React.Component {
  static defaultProps = {
    users: []
  };
  constructor(props) {
    super(props);
    console.log("UsersPage init", { props });
  }
  render() {
    const { loading, users, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Users" />
        <section className="content">
          {loading ? (
            <Loading />
          ) : (
            <Grid>
              <Grid.Row>
                <Grid.Column>
                  {/* <Button
                    as="a"
                    href={FlowRouter.path("App.admin.users.edit")}
                    floated="right"
                  >
                    <Icon name="plus" />
                    New User
                  </Button>
                  <Divider hidden clearing /> */}
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Emails</Table.HeaderCell>
                        <Table.HeaderCell>Roles</Table.HeaderCell>
                        <Table.HeaderCell>Registered</Table.HeaderCell>
                        <Table.HeaderCell collapsing>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {users.map(user => (
                        <Table.Row key={user._id}>
                          <Table.Cell>{user.name}</Table.Cell>
                          <Table.Cell>
                            {user.emails.map(email => email.address).join(", ")}
                          </Table.Cell>
                          <Table.Cell>
                            {user.roles ? user.roles.join(", ") : ""}
                          </Table.Cell>
                          <Table.Cell>
                            {moment(user.createdAt).format("LLL")}
                          </Table.Cell>
                          <Table.Cell collapsing>
                            <Button.Group basic>
                              <Button
                                href={FlowRouter.path("App.admin.users.edit", {
                                  userId: user._id
                                })}
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
