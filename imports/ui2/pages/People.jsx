import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { pick, debounce, defaultsDeep } from "lodash";

import Button from "../components/Button.jsx";
import More from "../components/More.jsx";
import PopupLabel from "../components/PopupLabel.jsx";
import Page from "../components/Page.jsx";

import Content from "../components/Content.jsx";
import PeopleTable from "../components/PeopleTable.jsx";

import TagFilter from "../components/TagFilter.jsx";
import PersonMetaButtons from "../components/PersonMetaButtons.jsx";
import Reaction from "../components/Reaction.jsx";

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
  .main-input {
    font-size: 1.2em;
    background: #fff;
  }
  .actions {
    flex: 0 0 auto;
    .button {
      background: #fff;
      margin: 0;
      border-color: #ddd;
      border-right: 0;
      .icon {
        border-color: #ddd;
      }
    }
  }
  label {
    display: block;
    display: flex;
    input[type="checkbox"],
    input[type="radio"] {
      flex: 0 0 auto;
      margin-right: 1rem;
    }
    .tip {
      display: block;
      font-size: 0.8em;
      color: #999;
    }
  }
  h4 {
    margin: 0 0 0.5rem;
    color: #666;
    font-weight: 600;
  }
  .from-to-input {
    font-size: 0.8em;
    margin: 0 0 1rem;
    .input {
      display: flex;
      align-items: center;
      input {
        margin: 0;
        padding: 0.5rem;
      }
      .between {
        padding: 0 0.5rem;
      }
    }
  }
  .reaction-count-input {
    margin: 0 0 1rem;
    font-size: 0.8em;
    .input {
      display: flex;
      align-items: center;
      width: 100%;
      margin-bottom: 0.5rem;
      span {
        white-space: nowrap;
        ${"" /* flex: 0 0 auto; */}
        display: inline-block;
        padding-right: 0.5rem;
        &:last-child {
          flex: 1 1 100%;
          padding-right: 0;
        }
      }
      input {
        padding: 0.5rem;
        margin: 0;
        width: 100%;
      }
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
  getSourceValue = () => {
    const { query } = this.state;
    if (query.source) {
      let value = {
        value: query.source,
        label: ""
      };
      switch (query.source) {
        case "facebook":
          value.label = "Facebook";
          break;
        case "import":
          value.label = "Importação";
          break;
        case "manual":
          value.label = "Manual";
          break;
        default:
      }
      return value;
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
                  className="main-input"
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
                      value: "manual",
                      label: "Manual"
                    },
                    {
                      value: "facebook",
                      label: "Facebook"
                    }
                  ]}
                  isSearchable={false}
                  isClearable={true}
                  onChange={this._handleSelectChange}
                  name="source"
                  value={this.getSourceValue()}
                  placeholder="Filtrar por origem"
                />
                <TagFilter
                  onChange={this._handleFormChange}
                  name="tag"
                  value={query.tag}
                  placeholder="Filtrar por tag"
                />
                <label>
                  <input type="checkbox" />
                  <span>
                    Formulário
                    <span className="tip">
                      Apenas pessoas que preencheram o formulário.
                    </span>
                  </span>
                </label>
                <label>
                  <input type="checkbox" />
                  <span>
                    Comentários
                    <span className="tip">
                      Apenas pessoas que comentaram ao menos 1 vez.
                    </span>
                  </span>
                </label>
                <label>
                  <input type="checkbox" />
                  <span>
                    Mensagens privadas
                    <span className="tip">
                      Apenas pessoas que podem receber mensagens privadas.
                    </span>
                  </span>
                </label>
                <More text="Mais opções">
                  <div className="from-to-input">
                    <h4>Data de inserção na base</h4>
                    <div className="input">
                      <div className="from">
                        <DatePicker placeholderText="Data" />
                      </div>
                      <span className="between">até</span>
                      <div className="from">
                        <DatePicker placeholderText="Data" />
                      </div>
                    </div>
                  </div>
                  <div className="reaction-count-input">
                    <h4>Quantidade de reações</h4>
                    <div className="input">
                      <span>ao menos</span>
                      <span>
                        <input type="number" placeholder="Quantidade" />
                      </span>
                    </div>
                    <Reaction.Filter showAny size="tiny" />
                  </div>
                </More>
              </form>
            </div>
            <div className="actions">
              <Button.Group vertical attached>
                <Button.WithIcon>
                  <a href="javascript:void(0);">Exportar resultados</a>
                  <span className="icon">
                    <PopupLabel
                      text="Gerenciar exportações"
                      bottomOffset="0.2rem"
                    >
                      <FontAwesomeIcon icon="cog" />
                    </PopupLabel>
                  </span>
                </Button.WithIcon>
                <Button.WithIcon>
                  <a href="javascript:void(0);">Importar planilha</a>
                  <span className="icon">
                    <PopupLabel
                      text="Gerenciar importações"
                      bottomOffset="0.2rem"
                    >
                      <FontAwesomeIcon icon="cog" />
                    </PopupLabel>
                  </span>
                </Button.WithIcon>
              </Button.Group>
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
