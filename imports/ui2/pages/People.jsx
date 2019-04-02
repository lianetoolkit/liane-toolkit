import React, { Component } from "react";
import Select from "react-select";
import { debounce, defaultsDeep } from "lodash";

import Page from "../components/Page.jsx";

import Content from "../components/Content.jsx";
import PeopleTable from "../components/PeopleTable.jsx";

import PersonMetaButtons from "../components/PersonMetaButtons.jsx";

export default class PeoplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      query: {
        q: ""
      }
    };
  }
  componentDidMount() {
    this.fetchPeople();
    this.setState({
      query: defaultsDeep(this.props.query, {
        q: ""
      })
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { query } = this.state;
    if (JSON.stringify(query) != JSON.stringify(prevState.query)) {
      this.fetchPeople();
    }
  }
  fetchPeople = debounce((options = {}) => {
    const { campaignId } = this.props;
    const { query } = this.state;
    FlowRouter.setQueryParams(query);
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
            this.setState({ people: data });
          }
        }
      );
    }
  }, 200);
  _handlePeopleChange = people => {
    this.setState({ people });
  };
  _handleFormChange = ({ target }) => {
    this.setState({
      query: {
        ...this.state.query,
        [target.name]: target.value
      }
    });
  };
  _handleSelectChange = (selected, { name }) => {
    let value = null;
    if (selected && selected.value) {
      value = selected.value;
    }
    this.setState({
      query: {
        ...this.state.query,
        [name]: value
      }
    });
  };
  categoriesOptions = () => {
    let options = [];
    for (let key in PersonMetaButtons.labels) {
      options.push({
        value: key,
        label: PersonMetaButtons.labels[key]
      });
    }
    return options;
  };
  getCategoryValue = () => {
    const { query } = this.state;
    if (query.category) {
      const label = PersonMetaButtons.labels[query.category];
      return { value: query.category, label };
    }
    return null;
  };
  render() {
    const { people, query, expanded } = this.state;
    return (
      <>
        <Page.Nav full large>
          <h3>Navegar nos contatos</h3>
          <form onSubmit={ev => ev.preventDefault()}>
            <input
              type="text"
              placeholder="Buscar por nome"
              onChange={this._handleFormChange}
              name="q"
              value={query.q}
            />
            <Select
              classNamePrefix="select"
              options={this.categoriesOptions()}
              isSearchable={false}
              isClearable={true}
              onChange={this._handleSelectChange}
              name="category"
              value={this.getCategoryValue()}
              placeholder="Filtrar por categoria"
            />
          </form>
        </Page.Nav>
        <Page.Content full compact>
          <PeopleTable
            people={people}
            onChange={this._handlePeopleChange}
            compact
          />
        </Page.Content>
      </>
    );
  }
}
