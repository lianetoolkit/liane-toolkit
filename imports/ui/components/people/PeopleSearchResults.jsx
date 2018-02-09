import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Table, Icon } from "semantic-ui-react";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";

export default class PeopleSearchResults extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, facebookId, people } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
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
                <Table.Cell>{person.name}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      );
    }
  }
}
