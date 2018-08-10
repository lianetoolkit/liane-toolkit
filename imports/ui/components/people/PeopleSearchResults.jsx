import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { randomColor } from "/imports/ui/utils/utils.jsx";
import styled from "styled-components";
import { Table, Icon, Grid, Dimmer, Button } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import PeopleMerge from "/imports/ui/components/people/PeopleMerge.jsx";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";
import moment from "moment";
import { get } from "lodash";

const Wrapper = styled.div`
  .last-interaction {
    font-size: 0.8em;
    color: #999;
  }
`;

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
    this.state = {
      people: [],
      duplicates: []
    };
  }
  componentDidMount() {
    const { people } = this.props;
    this.setState({ people });
    if (this.props.onChange) {
      this.props.onChange(this.props);
    }
  }
  _idMap(people) {
    if (people && people.length) {
      return people.map(p => p._id);
    }
    return [];
  }
  _duplicateNames(people) {
    people = people || this.state.people;
    let names = {};
    let duplicates = [];
    for (const person of people) {
      if (!names[person.name]) names[person.name] = 0;
      names[person.name]++;
    }
    for (const name in names) {
      duplicates.push({
        name,
        count: names[name],
        color: randomColor()
      });
    }
    this.setState({ duplicates });
  }
  componentWillReceiveProps(nextProps) {
    const { people } = this.state;
    const { editMode } = this.props;
    if (
      JSON.stringify(this._idMap(people)) !=
      JSON.stringify(this._idMap(nextProps.people))
    ) {
      if (nextProps.onChange) {
        nextProps.onChange(nextProps);
      }
      this.setState({ people: nextProps.people });
      if (nextProps.editMode) {
        this._duplicateNames(nextProps.people);
      }
    }
    if (editMode !== nextProps.editMode) {
      this._duplicateNames(nextProps.people);
    }
  }
  _handleMetaChange = data => {
    let people = [...this.state.people];
    people.forEach((person, i) => {
      if (person._id == data.personId) {
        people[i] = {
          ...person,
          campaignMeta: {
            ...person.campaignMeta,
            [data.metaKey]: data.metaValue
          }
        };
      }
    });
    this.setState({ people });
  };
  _handleMergeSubmit = () => {
    const { refresh } = this.props;
    if(refresh) refresh();
  }
  _getLastInteraction(person) {
    const { facebookId } = this.props;
    let str = "--";
    if (person.lastInteractionDate) {
      str = moment(person.lastInteractionDate).fromNow();
    }
    return <span className="last-interaction">{str}</span>;
  }
  _getMeta(person, key) {
    return get(person, "campaignMeta." + key);
  }
  render() {
    const {
      loading,
      editMode,
      loadingCount,
      facebookId,
      campaignId,
      count
    } = this.props;
    const { people, duplicates } = this.state;
    if (!loadingCount && count == 0) {
      return <p>No people were found.</p>;
    } else if (loading) {
      return <Loading />;
    } else if (people && people.length) {
      return (
        <Wrapper>
          {loadingCount ? (
            <p>Calculating people count...</p>
          ) : (
            <p>{count} people found.</p>
          )}
          <Table>
            <Table.Body>
              {people.map(person => (
                <Table.Row key={`commenter-${person._id}`}>
                  <Table.Cell collapsing>
                    {person.facebookId ? (
                      <a
                        target="_blank"
                        href={`https://facebook.com/${person.facebookId}`}
                      >
                        <Icon name="facebook official" />
                      </a>
                    ) : null}
                  </Table.Cell>
                  <Table.Cell singleLine collapsing>
                    <PeopleMetaButtons
                      person={person}
                      onChange={this._handleMetaChange}
                    />
                  </Table.Cell>
                  <Table.Cell collapsing>
                    <a
                      href={FlowRouter.path("App.campaignPeople.detail", {
                        campaignId,
                        personId: person._id
                      })}
                    >
                      {person.name}
                    </a>
                  </Table.Cell>
                  {editMode ? (
                    <>
                      <Table.Cell>
                        {this._getMeta(person, "basic_info.age")}
                      </Table.Cell>
                      <Table.Cell>
                        {this._getMeta(person, "contact.email")}
                      </Table.Cell>
                      <Table.Cell>
                        {this._getMeta(person, "contact.cellphone")}
                      </Table.Cell>
                      <Table.Cell>
                        {this._getMeta(person, "contact.telephone")}
                      </Table.Cell>
                      <Table.Cell collapsing>
                        <PeopleMerge
                          campaignId={campaignId}
                          duplicates={duplicates}
                          person={person}
                          onSubmit={this._handleMergeSubmit}
                        />
                      </Table.Cell>
                      <Table.Cell collapsing>
                        <a
                          href={FlowRouter.path("App.campaignPeople.edit", {
                            campaignId,
                            personId: person._id
                          })}
                        >
                          <Icon name="edit" /> Edit user
                        </a>
                      </Table.Cell>
                    </>
                  ) : (
                    <>
                      <Table.Cell>
                        {person.counts ? (
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
                        ) : null}
                      </Table.Cell>
                      <Table.Cell collapsing>
                        {person.lastInteractionDate
                          ? this._getLastInteraction(person)
                          : ""}
                      </Table.Cell>
                    </>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Wrapper>
      );
    } else {
      return <p>No people were found.</p>;
    }
  }
}
