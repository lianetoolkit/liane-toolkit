import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { randomColor } from "/imports/ui/utils/utils.jsx";
import styled from "styled-components";
import { Table, Icon, Dimmer, Button } from "semantic-ui-react";
import PeopleTable from "./PeopleTable.jsx";
import PeopleInteractivityGrid from "/imports/ui/components/people/PeopleInteractivityGrid.jsx";
import PeopleMerge from "/imports/ui/components/people/PeopleMerge.jsx";
import moment from "moment";
import { get } from "lodash";

const Wrapper = styled.div`
  .last-interaction {
    font-size: 0.8em;
    color: #999;
  }
`;

export default class PeopleSearchResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      duplicates: []
    };
    this._extraCells = this._extraCells.bind(this);
  }
  componentDidMount() {
    const { people } = this.props;
    this.setState({ people });
    if (this.props.onChange) {
      this.props.onChange(this.props);
    }
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
  _updatePeople(props) {
    const { people } = this.state;
    const { editMode } = this.props;
    if (JSON.stringify(people) != JSON.stringify(props.people)) {
      if (props.onChange) {
        props.onChange(props);
      }
      this.setState({ people: props.people });
      if (props.editMode) {
        this._duplicateNames(props.people);
      }
    }
    if (editMode !== props.editMode) {
      this._duplicateNames(props.people);
    }
  }
  componentWillReceiveProps(nextProps) {
    this._updatePeople(nextProps);
  }
  _handleTableChange = props => {
    this._updatePeople(props);
  };
  _handleMergeSubmit = () => {
    const { refresh } = this.props;
    if (refresh) refresh();
  };
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
  _handleRemoveClick = personId => () => {
    if (confirm("Are you sure?")) {
      Meteor.call("people.remove", { personId }, (err, res) => {
        if (err) {
          Alerts.error(err);
        } else {
          const { people } = this.state;
          const newPeople = [...people].filter(p => p._id !== personId);
          this.setState({
            people: newPeople
          });
          Alerts.success("Person removed successfully");
        }
      });
    }
  };
  _extraCells(person) {
    const { editMode, facebookId, campaignId } = this.props;
    const { duplicates } = this.state;
    if (editMode) {
      return (
        <>
          <Table.Cell>{this._getMeta(person, "basic_info.age")}</Table.Cell>
          <Table.Cell>{this._getMeta(person, "contact.email")}</Table.Cell>
          <Table.Cell>{this._getMeta(person, "contact.cellphone")}</Table.Cell>
          <Table.Cell>{this._getMeta(person, "contact.telephone")}</Table.Cell>
          <Table.Cell collapsing>
            <PeopleMerge
              campaignId={campaignId}
              duplicates={duplicates}
              person={person}
              onSubmit={this._handleMergeSubmit}
            />
          </Table.Cell>
          <Table.Cell collapsing>
            <Button.Group size="mini" basic>
              <Button
                href={FlowRouter.path("App.campaignPeople.edit", {
                  campaignId,
                  personId: person._id
                })}
              >
                <Icon name="edit" /> Edit
              </Button>
              <Button onClick={this._handleRemoveClick(person._id)}>
                <Icon name="close" /> Remove
              </Button>
            </Button.Group>
          </Table.Cell>
        </>
      );
    } else {
      return (
        <>
          <Table.Cell>
            {person.counts ? (
              <PeopleInteractivityGrid
                facebookId={facebookId}
                person={person}
              />
            ) : null}
          </Table.Cell>
          <Table.Cell collapsing>
            {person.lastInteractionDate ? this._getLastInteraction(person) : ""}
          </Table.Cell>
        </>
      );
    }
  }
  render() {
    const { loading, loadingCount, count } = this.props;
    const { people } = this.state;
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
          <PeopleTable
            people={people}
            extraCells={this._extraCells}
            onChange={this._handleTableChange}
          />
        </Wrapper>
      );
    } else {
      return <p>No people were found.</p>;
    }
  }
}
