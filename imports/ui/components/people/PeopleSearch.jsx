import _ from "underscore";
import React from "react";
import PeopleSearchContainer from "/imports/ui/containers/people/PeopleSearchContainer.jsx";
import { Segment, Form } from "semantic-ui-react";

export default class PeopleSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: ""
    };
    this._handleChange = this._handleChange.bind(this);
  }
  _handleChange = _.debounce((ev, { name, value }) => {
    this.setState({ [name]: value });
  }, 250);
  render() {
    const { search } = this.state;
    const { campaignId } = this.props;
    return (
      <Segment>
        <h3>Find people</h3>
        <Form.Input
          fluid
          placeholder="Search by name..."
          name="search"
          onChange={this._handleChange}
        />
        {search ? (
          <PeopleSearchContainer search={search} campaignId={campaignId} />
        ) : null}
      </Segment>
    );
  }
}
