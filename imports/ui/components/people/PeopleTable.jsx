import React from "react";
import { Table, Icon } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";

export default class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      people: []
    };
  }
  componentDidMount() {
    const { people } = this.props;
    this.setState({ people });
    if (this.props.onChange) {
      this.props.onChange(this.props);
    }
  }
  componentWillReceiveProps(nextProps) {
    const { people } = this.state;
    if (JSON.stringify(people) != JSON.stringify(nextProps.people)) {
      if (nextProps.onChange) {
        nextProps.onChange(nextProps);
      }
      this.setState({ people: nextProps.people });
    }
  }
  _handleMetaChange = data => {
    const { onChange } = this.props;
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
    if (onChange) onChange({ people });
  };
  render() {
    const { people, extraCells, ...props } = this.props;
    if (people && people.length) {
      return (
        <Table {...props}>
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
                      campaignId: person.campaignId,
                      personId: person._id
                    })}
                  >
                    {person.name}
                  </a>
                </Table.Cell>
                {extraCells ? extraCells(person) : <Table.Cell />}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      );
    }
    return null;
  }
}
