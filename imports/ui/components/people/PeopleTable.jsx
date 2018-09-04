import React from "react";
import { Table, Icon } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import PeopleFormButton from "/imports/ui/components/people/PeopleFormButton.jsx";
import PersonNewFlag from "/imports/ui/components/people/NewFlag.jsx";

const Fragment = React.Fragment;

const PersonName = ({ name }) => {
  if (name) {
    const display = name.substr(0, 16);
    let ellipsis = false;
    if (display.length != name.length) {
      ellipsis = true;
    }
    return (
      <span title={name}>
        {display}
        {ellipsis ? "..." : ""}
      </span>
    );
  } else {
    return "Unknown";
  }
};

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
    const { people, extraCells, extraRows, ...props } = this.props;
    const campaign = Session.get("campaign");
    if (people && people.length) {
      return (
        <Table basic="very" compact="very" {...props}>
          <Table.Body>
            {people.map(person => (
              <Fragment key={person._id}>
                <Table.Row>
                  {/* <Table.Cell collapsing>
                    {person.facebookId ? (
                      <a
                        target="_blank"
                        href={`https://facebook.com/${person.facebookId}`}
                      >
                        <Icon name="facebook official" />
                      </a>
                    ) : null}
                  </Table.Cell> */}
                  <Table.Cell singleLine collapsing>
                    <PeopleFormButton person={person} iconOnly={true} />
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
                      <PersonName name={person.name} />{" "}
                      <PersonNewFlag person={person} />
                    </a>
                  </Table.Cell>
                  {extraCells ? extraCells(person) : <Table.Cell />}
                </Table.Row>
                {extraRows ? extraRows(person) : null}
              </Fragment>
            ))}
          </Table.Body>
        </Table>
      );
    }
    return null;
  }
}
