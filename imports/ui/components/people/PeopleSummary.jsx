import React from "react";
import { Grid, Segment, Table, Icon } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";

export default class PeopleSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      peopleSummary: null
    };
    this._onMetaButtonsChange = this._onMetaButtonsChange.bind(this);
  }
  componentDidMount() {
    const { peopleSummary } = this.props;
    this.setState({ peopleSummary });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.facebookId !== this.props.facebookId) {
      this.setState({ peopleSummary: null });
    }
    if (nextProps.peopleSummary != this.props.peopleSummary) {
      this.setState({ peopleSummary: nextProps.peopleSummary });
    }
  }
  _onMetaButtonsChange(data) {
    const { peopleSummary } = this.state;
    // Likers
    peopleSummary.topLikers.forEach(person => {
      if (person._id == data.personId) {
        person.campaignMeta[data.metaKey] = data.metaValue;
      }
    });
    // Commenters
    peopleSummary.topCommenters.forEach(person => {
      if (person._id == data.personId) {
        person.campaignMeta[data.metaKey] = data.metaValue;
      }
    });
    this.setState({ peopleSummary: Object.assign({}, peopleSummary) });
  }
  render() {
    const { peopleSummary } = this.state;
    const { facebookId, campaignId } = this.props;
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
                          <a
                            target="_blank"
                            href={`https://facebook.com/${person.facebookId}`}
                          >
                            <Icon name="facebook" />
                          </a>
                        </Table.Cell>
                        <Table.Cell>
                          <a
                            href={FlowRouter.path("App.campaignPeople.detail", {
                              campaignId,
                              personId: person._id
                            })}
                          >
                            {person.name}
                          </a>
                        </Table.Cell>
                        <Table.Cell singleLine>
                          <PeopleMetaButtons
                            person={person}
                            onChange={this._onMetaButtonsChange}
                          />
                        </Table.Cell>
                        {person.counts[facebookId] ? (
                          <Table.Cell singleLine>
                            {person.counts[facebookId].likes} likes
                          </Table.Cell>
                        ) : null}
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
                          <a
                            target="_blank"
                            href={`https://facebook.com/${person.facebookId}`}
                          >
                            <Icon name="facebook" />
                          </a>
                        </Table.Cell>
                        <Table.Cell>
                          <a
                            href={FlowRouter.path("App.campaignPeople.detail", {
                              campaignId,
                              personId: person._id
                            })}
                          >
                            {person.name}
                          </a>
                        </Table.Cell>
                        <Table.Cell singleLine>
                          <PeopleMetaButtons
                            person={person}
                            onChange={this._onMetaButtonsChange}
                          />
                        </Table.Cell>
                        {person.counts[facebookId] ? (
                          <Table.Cell singleLine>
                            {person.counts[facebookId].comments || 0} comments
                          </Table.Cell>
                        ) : null}
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
