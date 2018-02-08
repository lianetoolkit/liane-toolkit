import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Table } from "semantic-ui-react";

export default class PeopleSearchResults extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, people } = this.props;
    console.log(people);
    if (loading) {
      return <Loading />;
    } else {
      return (
        <div>
          {people.map(person => <p key={person._id}>{person.name}</p>)}
        </div>
      );
    }
  }
}
