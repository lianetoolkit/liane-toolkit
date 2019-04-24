import React, { Component } from "react";
import styled, { css } from "styled-components";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { pick, debounce, defaultsDeep } from "lodash";

import { PersonImportButton } from "../components/PersonImport.jsx";
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
      .disabled {
        color: #999;
      }
    }
  }
  label {
    display: flex;
    align-items: center;
    border-radius: 7px;
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    input[type="checkbox"],
    input[type="radio"] {
      flex: 0 0 auto;
      margin: 0 1rem 0 0;
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

const PeopleContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .people-nav {
    flex: 0 0 auto;
  }
  .people-table {
    flex: 1 1 100%;
    overflow-x: hidden;
    overflow-y: auto;
    transition: opacity 0.1s linear;
  }
  ${props =>
    props.loading &&
    css`
      .people-table {
        opacity: 0.25;
      }
    `}
`;

const PeopleNavContainer = styled.nav`
  display: flex;
  align-items: center;
  border-bottom: 1px solid #ccc;
  p {
    flex: 1 1 100%;
    padding: 0.75rem 1rem;
    margin: 0;
    font-size: 0.7em;
    color: #666;
  }
  a {
    flex: 0 0 auto;
    padding: 0.75rem 1rem;
    color: #333;
    &:hover,
    &:focus {
      color: #000;
    }
    &.disabled {
      cursor: default;
      color: #bbb;
    }
  }
`;

class PeopleNav extends Component {
  handlePrev = () => {
    const { onPrev } = this.props;
    if (onPrev) {
      onPrev();
    }
  };
  handleNext = () => {
    const { onNext } = this.props;
    if (onNext) {
      onNext();
    }
  };
  hasPrev = () => {
    const { skip, count } = this.props;
    return count && skip;
  };
  hasNext = () => {
    const { skip, limit, count } = this.props;
    return count && skip * limit + limit < count;
  };
  render() {
    const { skip, limit, count, loading } = this.props;
    return (
      <PeopleNavContainer className="people-nav">
        {isNaN(count) ? (
          <p>Calculando...</p>
        ) : (
          <p>
            {!count
              ? "Nenhum resultado"
              : `Exibindo ${skip * limit + 1}-${Math.min(
                  count,
                  skip * limit + limit
                )} de ${count}`}
          </p>
        )}
        <a
          href="javascript:void(0);"
          onClick={this.handlePrev}
          className={this.hasPrev() ? "" : "disabled"}
        >
          <FontAwesomeIcon icon="chevron-left" />
        </a>
        <a
          href="javascript:void(0);"
          onClick={this.handleNext}
          className={this.hasNext() ? "" : "disabled"}
        >
          <FontAwesomeIcon icon="chevron-right" />
        </a>
      </PeopleNavContainer>
    );
  }
}

export default class PeoplePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      loadingCount: false,
      people: [],
      query: {
        q: "",
        form: false,
        commented: false,
        private_reply: false
      },
      options: {
        skip: 0,
        limit: 20
      }
    };
  }
  componentDidMount() {
    this.fetchPeople();
    this.setState({
      query: defaultsDeep(this.props.query, {
        q: "",
        form: false,
        commented: false,
        private_reply: false
      }),
      options: defaultsDeep(this.props.options, {
        limit: 20,
        skip: 0
      })
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const { query, options } = this.state;
    if (
      JSON.stringify(query) != JSON.stringify(prevState.query) ||
      JSON.stringify(options) != JSON.stringify(prevState.options)
    ) {
      this.setLoading();
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
    if (options.skip) {
      queryOptions.skip = options.skip * queryOptions.limit;
    }
    if (options.sort) {
      queryOptions.sort = options.sort;
      queryOptions.order = options.order == "desc" ? -1 : 1;
    }
    return queryOptions;
  };
  setLoading = debounce(
    () => {
      this.setState({
        loading: true,
        loadingCount: true
      });
    },
    200,
    {
      leading: true,
      trailing: false
    }
  );
  fetchPeople = debounce(() => {
    const { campaignId } = this.props;
    const { query, options } = this.state;
    FlowRouter.setQueryParams(this.sanitizeQueryParams(query));
    FlowRouter.setQueryParams(
      this.sanitizeQueryParams(options, ["sort", "order"])
    );
    if (campaignId) {
      const methodParams = {
        campaignId,
        query,
        options: this.buildOptions(options)
      };
      Meteor.call("people.search", methodParams, (err, data) => {
        if (err) {
          this.setState({
            loading: false
          });
        } else {
          this.setState({ people: data, loading: false });
        }
      });
      Meteor.call("people.search.count", methodParams, (err, data) => {
        if (err) {
          this.setState({
            loadingCount: false
          });
        } else {
          this.setState({ count: data, loadingCount: false });
        }
      });
    }
  }, 200);
  _handlePrev = () => {
    const { options } = this.state;
    if (options.skip > 0) {
      this.setState({
        options: {
          ...options,
          skip: options.skip - 1
        }
      });
    }
  };
  _handleNext = () => {
    const { options, count } = this.state;
    if (options.skip * options.limit + options.limit < count) {
      this.setState({
        options: {
          ...options,
          skip: options.skip + 1
        }
      });
    }
  };
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
        ...options,
        skip: 0
      }
    });
  };
  _handleFormChange = ({ target }) => {
    this.setState({
      query: {
        ...this.state.query,
        [target.name]: target.value
      },
      options: {
        ...this.state.options,
        skip: 0
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
      },
      options: {
        ...this.state.options,
        skip: 0
      }
    });
  };
  _handleCheckboxChange = ({ target }) => {
    this.setState({
      query: {
        ...this.state.query,
        [target.name]: target.checked
      },
      options: {
        ...this.state.options,
        skip: 0
      }
    });
  };
  _handleDateChange = type => value => {
    this.setState({
      query: {
        ...this.state.query,
        [`creation_${type}`]: value ? value.format("YYYY-MM-DD") : null
      },
      options: {
        ...this.state.options,
        skip: 0
      }
    });
  };
  _getDateValue = key => {
    const { campaign } = this.props;
    const { query } = this.state;
    let defaultDate;
    switch (key) {
      case "creation_from":
        defaultDate = campaign.createdAt;
        break;
      default:
        defaultDate = new Date();
    }
    return moment(query[key] || defaultDate);
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
    const { campaign, importCount } = this.props;
    const {
      loading,
      people,
      query,
      options,
      expanded,
      skip,
      count,
      loadingCount
    } = this.state;
    return (
      <>
        <Page.Nav full plain>
          <PeopleFilters>
            <div className="filters">
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
                {this.props.tags && this.props.tags.length ? (
                  <TagFilter
                    tags={this.props.tags}
                    onChange={this._handleFormChange}
                    name="tag"
                    value={query.tag}
                    placeholder="Filtrar por tag"
                  />
                ) : null}
                <label>
                  <input
                    type="checkbox"
                    checked={query.form}
                    onChange={this._handleCheckboxChange}
                    name="form"
                  />
                  <span>
                    Formulário
                    <span className="tip">
                      Apenas pessoas que preencheram o formulário.
                    </span>
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={query.commented}
                    onChange={this._handleCheckboxChange}
                    name="commented"
                  />
                  <span>
                    Comentários
                    <span className="tip">
                      Apenas pessoas que comentaram ao menos 1 vez.
                    </span>
                  </span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={query.private_reply}
                    onChange={this._handleCheckboxChange}
                    name="private_reply"
                  />
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
                        <DatePicker
                          name="creation_from"
                          selectsStart
                          selected={this._getDateValue("creation_from")}
                          startDate={this._getDateValue("creation_from")}
                          endDate={this._getDateValue("creation_to")}
                          placeholderText="Data"
                          onChange={this._handleDateChange("from")}
                          minDate={new Date(campaign.createdAt)}
                          maxDate={new Date()}
                          isClearable={true}
                        />
                      </div>
                      <span className="between">até</span>
                      <div className="to">
                        <DatePicker
                          name="creation_to"
                          selectsEnd
                          selected={this._getDateValue("creation_to")}
                          startDate={this._getDateValue("creation_from")}
                          endDate={this._getDateValue("creation_to")}
                          placeholderText="Data"
                          onChange={this._handleDateChange("to")}
                          minDate={new Date(campaign.createdAt)}
                          maxDate={new Date()}
                          isClearable={true}
                        />
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
                    <PopupLabel text="Gerenciar exportações" position="center">
                      <FontAwesomeIcon icon="cog" />
                    </PopupLabel>
                  </span>
                </Button.WithIcon>
                <Button.WithIcon>
                  <PersonImportButton importCount={importCount} />
                  <span className="icon">
                    <PopupLabel text="Gerenciar importações" position="center">
                      <FontAwesomeIcon icon="cog" />
                    </PopupLabel>
                  </span>
                </Button.WithIcon>
              </Button.Group>
            </div>
          </PeopleFilters>
        </Page.Nav>
        {/* <Page.Content full compact> */}
        <PeopleContent loading={loading}>
          <PeopleNav
            skip={options.skip}
            limit={options.limit}
            count={count}
            loading={loadingCount}
            onNext={this._handleNext}
            onPrev={this._handlePrev}
          />
          <PeopleTable
            tags={this.props.tags}
            people={people}
            options={options}
            onChange={this._handlePeopleChange}
            onSort={this._handleTableSort}
            compact
            scrollable
          />
        </PeopleContent>
        {/* </Page.Content> */}
      </>
    );
  }
}
