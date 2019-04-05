import React, { Component } from "react";
import styled from "styled-components";
import Select from "react-select";
import { pick, debounce, defaultsDeep } from "lodash";

import Page from "../components/Page.jsx";
import Button from "../components/Button.jsx";

import Content from "../components/Content.jsx";
import PeopleTable from "../components/PeopleTable.jsx";

import PersonMetaButtons from "../components/PersonMetaButtons.jsx";

const PeopleFilters = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  font-size: 0.8em;
  .filters {
    flex: 1 1 100%;
    overflow: auto;
    padding: 3.25rem 0 2rem 1rem;
  }
  .actions {
    flex: 0 0 auto;
    border-top: 1px solid #ccc;
    padding: 1rem;
    .button {
      margin: 0;
    }
  }
`;

export default class PeoplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      people: [],
      query: {
        q: ""
      },
      options: {
        limit: 20
      }
    };
  }
  componentDidMount() {
    this.fetchPeople();
    this.setState({
      query: defaultsDeep(this.props.query, {
        q: ""
      }),
      options: defaultsDeep(this.props.options, {
        limit: 20
      })
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { query, options } = this.state;
    if (
      JSON.stringify(query) != JSON.stringify(prevState.query) ||
      JSON.stringify(options) != JSON.stringify(prevState.options)
    ) {
      this.fetchPeople();
    }
  }
  sanitizeQueryParams = (params, allowedParams = []) => {
    let sanitized = {};
    for (let key in params) {
      if (params[key]) {
        sanitized[key] = params[key];
      } else {
        sanitized[key] = null;
      }
    }
    if (allowedParams.length) {
      return pick(sanitized, allowedParams);
    }
    return sanitized;
  };
  buildOptions = options => {
    let queryOptions = {};
    if (options.limit) {
      queryOptions.limit = options.limit;
    }
    if (options.sort) {
      queryOptions.sort = options.sort;
      queryOptions.order = options.order == "desc" ? -1 : 1;
    }
    return queryOptions;
  };
  fetchPeople = debounce(() => {
    const { campaignId } = this.props;
    const { query, options } = this.state;
    FlowRouter.setQueryParams(this.sanitizeQueryParams(query));
    FlowRouter.setQueryParams(
      this.sanitizeQueryParams(options, ["sort", "order"])
    );
    if (campaignId) {
      Meteor.call(
        "people.search",
        {
          campaignId,
          query,
          options: this.buildOptions(options)
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
  _handleTableSort = (sort, order) => {
    let options = {};
    if (!order) {
      options = { order: "", sort: "" };
    } else {
      options = { order, sort };
    }
    this.setState({
      options: {
        ...this.state.options,
        ...options
      }
    });
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
    const { people, query, options, expanded } = this.state;
    return (
      <>
        <Page.Nav full plain>
          <PeopleFilters>
            <div className="filters">
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
                <Select
                  classNamePrefix="select"
                  options={[
                    {
                      value: "import",
                      label: "Importação"
                    },
                    {
                      value: "facebook",
                      label: "Facebook"
                    }
                  ]}
                  isSearchable={false}
                  isClearable={true}
                  // onChange={this._handleSelectChange}
                  name="source"
                  // value={this.getCategoryValue()}
                  placeholder="Filtrar por origem"
                />
                <Select
                  classNamePrefix="select"
                  // options={}
                  isSearchable={false}
                  isClearable={true}
                  // onChange={this._handleSelectChange}
                  name="tag"
                  // value={this.getCategoryValue()}
                  placeholder="Filtrar por tag"
                />
                <label>
                  <input type="checkbox" /> Formulário. Apenas pessoas que
                  preencheram o formulário.
                </label>
                <label>
                  <input type="checkbox" /> Comentários. Apenas pessoas que
                  comentaram ao menos 1 vez.
                </label>
                <label>
                  <input type="checkbox" /> Mensagens privadas. Apenas pessoas
                  que podem receber mensagens privadas.
                </label>
              </form>
            </div>
            <div className="actions">
              <Button>Exportar resultados</Button>
            </div>
            <div className="actions">
              <Button>Importar pessoas</Button>
              <Button>Gerenciar importações</Button>
            </div>
          </PeopleFilters>
        </Page.Nav>
        <Page.Content full compact>
          <PeopleTable
            people={people}
            options={options}
            onChange={this._handlePeopleChange}
            onSort={this._handleTableSort}
            compact
          />
        </Page.Content>
      </>
    );
  }
}
