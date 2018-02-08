import React from "react";
import { Grid, Segment, Table } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";

export default class PeopleSummary extends React.Component {
  render() {
    const { peopleSummary, facebookId } = this.props;
    if (peopleSummary) {
      return (
        <Segment>
          <p>{peopleSummary.totalPeople} people in the database</p>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                <h3>Top likes</h3>
                <Table>
                  <Table.Body>
                    {peopleSummary.topLikers.map(person => (
                      <Table.Row key={`liker-${person._id}`}>
                        <Table.Cell>
                          {person.name}
                        </Table.Cell>
                        <Table.Cell>
                          <PeopleMetaButtons person={person} />
                        </Table.Cell>
                        <Table.Cell>
                          {person.counts[facebookId].likes} likes
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Grid.Column>
              <Grid.Column>
                <h3>Top comments</h3>
                <Table>
                  <Table.Body>
                    {peopleSummary.topCommenters.map(person => (
                      <Table.Row key={`commenter-${person._id}`}>
                        <Table.Cell>
                          {person.name}
                        </Table.Cell>
                        <Table.Cell>
                          <PeopleMetaButtons person={person} />
                        </Table.Cell>
                        <Table.Cell>
                          {person.counts[facebookId].comments} comments
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      );
    } else {
      return null;
    }
  }
}
