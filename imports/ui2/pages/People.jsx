import React, { Component } from "react";

import Page from "../components/Page.jsx";

import Content from "../components/Content.jsx";
import PeopleTable from "../components/PeopleTable.jsx";

export default class PeoplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstFetch: false,
      people: []
    };
  }
  componentDidMount() {
    this.fetchPeople();
  }
  fetchPeople(query = {}, options = {}) {
    const { campaignId } = this.props;
    if (campaignId) {
      Meteor.call(
        "people.search",
        {
          campaignId,
          query,
          options
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            this.setState({ people: data, firstFetch: true });
          }
        }
      );
    }
  }
  _handleChange = people => {
    this.setState({ people });
  };
  render() {
    const { people, expanded } = this.state;
    if (people && people.length) {
      return (
        <>
          <Page.Nav full large>
            <h3>Navegar nos contatos</h3>
            <form>
              <input type="text" placeholder="Buscar por nome" />
            </form>
          </Page.Nav>
          <Page.Content full compact>
            <PeopleTable
              people={people}
              onChange={this._handleChange}
              compact
            />
          </Page.Content>
        </>
      );
    } else {
      return null;
    }
  }
}
