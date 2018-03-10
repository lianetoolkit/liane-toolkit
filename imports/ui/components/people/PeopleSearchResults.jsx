import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import { Table, Icon, Grid } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";

const Interactivity = styled.div`
  opacity: 0.75;
  .grid {
    text-align: center;
    color: #999;
    img,
    .icon {
      display: inline-block;
      float: left;
      margin-right: 0.5rem;
      color: #333;
    }
  }
`;

const reactions = ["like", "love", "wow", "haha", "sad", "angry"];

export default class PeopleSearchResults extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, facebookId, campaignId, people, totalCount } = this.props;
    if (loading) {
      return <Loading />;
    } else if (people.length) {
      return (
        <div>
          <p>{totalCount} people found.</p>
          <Table>
            <Table.Body>
              {people.map(person => (
                <Table.Row key={`commenter-${person._id}`}>
                  <Table.Cell collapsing>
                    <a
                      target="_blank"
                      href={`https://facebook.com/${person.facebookId}`}
                    >
                      <Icon name="facebook" />
                    </a>
                  </Table.Cell>
                  <Table.Cell singleLine collapsing>
                    <PeopleMetaButtons
                      person={person}
                      onChange={this._onMetaButtonsChange}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={FlowRouter.path("App.campaignPeople.detail", {
                        campaignId,
                        personId: person.__originalId
                      })}
                    >
                      {person.name}
                    </a>
                  </Table.Cell>
                  <Table.Cell>
                    <Interactivity>
                      <Grid
                        className="interactivity"
                        widths="equal"
                        columns={7}
                        verticalAlign="middle"
                      >
                        <Grid.Row>
                          <Grid.Column>
                            <Icon name="comment" />
                            {person.counts[facebookId] ? (
                              <span>
                                {person.counts[facebookId].comments || 0}
                              </span>
                            ) : (
                              <span>0</span>
                            )}
                          </Grid.Column>
                          {reactions.map(reaction => (
                            <Grid.Column key={reaction}>
                              <Reaction size="tiny" reaction={reaction} />
                              {person.counts[facebookId] &&
                              person.counts[facebookId].reactions ? (
                                <span>
                                  {
                                    person.counts[facebookId].reactions[
                                      reaction
                                    ]
                                  }
                                </span>
                              ) : (
                                <span>0</span>
                              )}
                            </Grid.Column>
                          ))}
                        </Grid.Row>
                      </Grid>
                    </Interactivity>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      );
    } else {
      return <p>No people were found.</p>;
    }
  }
}
