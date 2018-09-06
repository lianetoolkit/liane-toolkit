import _ from "underscore";
import React from "react";
import styled from "styled-components";
import PeopleSearchContainer from "/imports/ui/containers/people/PeopleSearchContainer.jsx";
import moment from "moment";
import DatePicker from "react-datepicker";
import {
  Segment,
  Form,
  Dropdown,
  Input,
  Checkbox,
  Select,
  Grid,
  Popup,
  Icon,
  Button,
  Divider,
  Pagination
} from "semantic-ui-react";

import "react-datepicker/dist/react-datepicker.css";

const Wrapper = styled.div`
  .filter-label {
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.1rem;
    font-size: 0.8em;
    display: block;
    margin-bottom: 0.5rem;
  }
  .more-options {
    margin-top: 1rem;
  }
  .react-datepicker-wrapper {
    display: block;
    > div {
      display: block;
    }
    input[type="text"] {
      margin: 0em;
      width: 100%;
      box-sizing: border-box;
      max-width: 100%;
      -ms-flex: 1 0 auto;
      flex: 1 0 auto;
      outline: none;
      -webkit-tap-highlight-color: rgba(255, 255, 255, 0);
      text-align: left;
      line-height: 1.21428571em;
      font-family: "Roboto", "Helvetica Neue", Arial, Helvetica, sans-serif;
      padding: 0.67857143em 1em;
      background: #ffffff;
      border: 1px solid rgba(34, 36, 38, 0.11);
      color: #212121;
      border-radius: 0;
      transition: box-shadow 0.1s ease, border-color 0.1s ease;
      box-shadow: none;
    }
  }
`;

const flags = [
  {
    name: "Supporters",
    icon: "star",
    prop: "supporter"
  },
  {
    name: "Volunteers",
    icon: "hand point up",
    prop: "volunteer"
  },
  {
    name: "Mobilizers",
    icon: "users",
    prop: "mobilizer"
  },
  {
    name: "Donors",
    icon: "currency",
    prop: "donor"
  },
  {
    name: "Incluencers",
    icon: "certificate",
    prop: "influencer"
  },
  {
    name: "Voters",
    icon: "thumbs up",
    prop: "voter"
  },
  {
    name: "Non voters",
    icon: "calendar times",
    prop: "non-voter"
  },
  {
    name: "Trolls",
    icon: "dont",
    prop: "troll"
  }
];

export default class PeopleSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage: 1,
      count: 0,
      search: {
        q: "",
        accountFilter: "all"
      },
      options: {
        limit: 15,
        skip: 0,
        sort: "auto",
        facebookId: props.facebookId,
        campaignId: props.campaignId
      }
    };
    this._handleSearchChange = this._handleSearchChange.bind(this);
    this._handleOptionChange = this._handleOptionChange.bind(this);
    this._handleSortChange = this._handleSortChange.bind(this);
    this._toggleMeta = this._toggleMeta.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { facebookId } = this.props;
    const { options } = this.state;
    if (nextProps.facebookId !== facebookId) {
      this.setState({
        activePage: 1,
        options: {
          ...options,
          skip: 0,
          facebookId: nextProps.facebookId
        }
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onQuery } = this.props;
    const { search, options } = this.state;
    if (JSON.stringify(search) != JSON.stringify(prevState.search)) {
      if (onQuery) {
        onQuery(search, options);
      }
    }
  }
  _toggleMeta = prop => {
    return () => {
      const { search } = this.state;
      if (!search[`campaignMeta.${prop}`]) {
        this.setState({
          search: {
            ...search,
            [`campaignMeta.${prop}`]: true
          }
        });
      } else {
        let newSearch = { ...search };
        delete newSearch[`campaignMeta.${prop}`];
        this.setState({
          search: newSearch
        });
      }
    };
  };
  _handleSearchChange = _.debounce((ev, { name, value }) => {
    const { search, options } = this.state;
    this.setState({
      activePage: 1,
      search: { ...search, [name]: value },
      options: { ...options, skip: 0 }
    });
  }, 250);
  _handleOptionChange = _.debounce((ev, { name, value }) => {
    const { options } = this.state;
    this.setState({
      activePage: 1,
      options: { ...options, [name]: value, skip: 0 }
    });
  }, 250);
  _handleSortChange = _.debounce((ev, { value }) => {
    const { options } = this.state;
    this.setState({
      activePage: 1,
      options: { ...options, sort: value, skip: 0 }
    });
  }, 250);
  _handleFilterClick = (type, value) => ev => {
    ev.preventDefault();
    const { facebookId } = this.props;
    const { search, options } = this.state;
    let newSearch = {};
    switch (type) {
      case "other":
        newSearch = {
          ...search,
          accountFilter: this._isFilter("other", value) ? "all" : value
        };
        break;
      case "tag":
        if (!this._isFilter("tag", value)) {
          newSearch = {
            ...search,
            "campaignMeta.basic_info.tags": { $in: [value] }
          };
        } else {
          newSearch = { ...search };
          delete newSearch["campaignMeta.basic_info.tags"];
        }
        break;
      case "filledForm":
        if (!this._isFilter("filledForm")) {
          newSearch = { ...search, filledForm: true };
        } else {
          newSearch = { ...search };
          delete newSearch.filledForm;
        }
        break;
      case "hasComments":
        if (!this._isFilter("hasComments")) {
          newSearch = {
            ...search,
            [`counts.${facebookId}.comments`]: { $gte: 1 }
          };
        } else {
          newSearch = { ...search };
          delete newSearch[`counts.${facebookId}.comments`];
        }
        break;
      case "canReceivePrivateReply":
        if (!this._isFilter("canReceivePrivateReply")) {
          newSearch = {
            ...search,
            canReceivePrivateReply: { $in: [facebookId] }
          };
        } else {
          newSearch = { ...search };
          delete newSearch["canReceivePrivateReply"];
        }
        break;
      default:
        newSearch = { ...search, accountFilter: "all" };
        delete newSearch["campaignMeta.basic_info.tags"];
        delete newSearch[`counts.${facebookId}.comments`];
        delete newSearch.filledForm;
        delete newSearch.canReceivePrivateReply;
    }
    this.setState({
      activePage: 1,
      search: newSearch,
      options: { ...options, skip: 0 }
    });
  };
  _handleDataChange = data => {
    this.setState({ count: data.count });
  };
  _handlePageChange = (e, { activePage }) => {
    const { options } = this.state;
    this.setState({
      activePage,
      options: {
        ...options,
        skip: (activePage - 1) * options.limit
      }
    });
  };
  _handleMoreOptionsClick = () => {
    const { moreOptions } = this.state;
    this.setState({
      moreOptions: !moreOptions
    });
  };
  _getPageCount() {
    const { count, options } = this.state;
    if (count) {
      return Math.floor(count / options.limit);
    }
    return 0;
  }
  _isFilter = (type, value) => {
    const { facebookId } = this.props;
    const { search } = this.state;
    switch (type) {
      case "other":
        return search.accountFilter && search.accountFilter == value;
        break;
      case "tag":
        return (
          search["campaignMeta.basic_info.tags"] &&
          search["campaignMeta.basic_info.tags"].$in[0] == value
        );
        break;
      case "filledForm":
        return search.filledForm;
      case "hasComments":
        return search[`counts.${facebookId}.comments`];
      case "canReceivePrivateReply":
        return search.canReceivePrivateReply;
      default:
        return (
          search.filledForm ||
          search.canReceivePrivateReply ||
          search[`counts.${facebookId}.comments`] ||
          search.accountFilter !== "all" ||
          !!search["campaignMeta.basic_info.tags"]
        );
    }
  };
  render() {
    const { activePage, search, moreOptions, options } = this.state;
    const { campaignId, facebookId, tags, editMode } = this.props;
    const pageCount = this._getPageCount();
    return (
      <Wrapper>
        <h3>Find people</h3>
        <Grid columns={4} verticalAlign="middle">
          <Grid.Row>
            <Grid.Column width={4}>
              <span className="filter-label">Text search</span>
              <Form.Field
                fluid
                control={Input}
                placeholder="Find anything..."
                name="q"
                onChange={this._handleSearchChange}
              />
            </Grid.Column>
            <Grid.Column width={6}>
              <span className="filter-label">Filter marked as</span>
              <Button.Group basic fluid>
                {flags.map(flag => (
                  <Popup
                    key={flag.prop}
                    trigger={
                      <Button
                        active={search[`campaignMeta.${flag.prop}`]}
                        icon={flag.icon}
                        onClick={this._toggleMeta(flag.prop)}
                      />
                    }
                    content={flag.name}
                  />
                ))}
              </Button.Group>
            </Grid.Column>
            <Grid.Column width={3}>
              <span className="filter-label">Filter</span>
              <Dropdown
                text="Select a filter"
                icon="filter"
                fluid
                button
                labeled
                basic
                color="white"
                className="icon"
              >
                <Dropdown.Menu>
                  {this._isFilter() ? (
                    <Dropdown.Item
                      icon="cancel"
                      text="Clear all filters"
                      onClick={this._handleFilterClick()}
                    />
                  ) : null}
                  {tags && tags.length ? (
                    <>
                      <Dropdown.Header icon="tags" content="Tags" />
                      {tags.map(tag => (
                        <Dropdown.Item
                          key={tag._id}
                          icon={`${
                            this._isFilter("tag", tag._id) ? "check" : ""
                          } circle outline`}
                          text={tag.name}
                          onClick={this._handleFilterClick("tag", tag._id)}
                        />
                      ))}
                      <Dropdown.Divider />
                      <Dropdown.Header content="Other filters" />
                    </>
                  ) : null}
                  <Dropdown.Item
                    onClick={this._handleFilterClick("other", "import")}
                    icon={`${
                      this._isFilter("other", "import") ? "check" : ""
                    } circle outline`}
                    text="Imported people"
                  />
                  <Dropdown.Item
                    icon={`${
                      this._isFilter("other", "account") ? "check" : ""
                    } circle outline`}
                    text="Only people from this page"
                    onClick={this._handleFilterClick("other", "account")}
                  />
                  <Dropdown.Item
                    icon={`${
                      this._isFilter("filledForm") ? "check" : ""
                    } circle outline`}
                    text="Filled form"
                    onClick={this._handleFilterClick("filledForm")}
                  />
                  <Dropdown.Item
                    icon={`${
                      this._isFilter("hasComments") ? "check" : ""
                    } circle outline`}
                    text="Has comments"
                    onClick={this._handleFilterClick("hasComments")}
                  />
                  <Dropdown.Item
                    icon={`${
                      this._isFilter("canReceivePrivateReply") ? "check" : ""
                    } circle outline`}
                    text="Can receive private reply"
                    onClick={this._handleFilterClick("canReceivePrivateReply")}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </Grid.Column>
            <Grid.Column width={3}>
              <span className="filter-label">Sorting</span>
              <Form.Field
                control={Select}
                onChange={this._handleSortChange}
                value={options.sort}
                fluid
                options={[
                  {
                    key: "auto",
                    value: "auto",
                    text: "Auto"
                  },
                  {
                    key: "lastInteraction",
                    value: "lastInteraction",
                    text: "Last interaction"
                  },
                  {
                    key: "name",
                    value: "name",
                    text: "Name"
                  },
                  {
                    key: "comments",
                    value: "comments",
                    text: "Comments"
                  },
                  {
                    key: "reactions",
                    value: "likes",
                    text: "Reactions"
                  }
                ]}
              />
            </Grid.Column>
          </Grid.Row>
          {moreOptions ? (
            <Grid.Row columns={2} widths="equal">
              <Grid.Column>
                <span className="filter-label">Creation date</span>
                <Grid>
                  <Grid.Row columns={2} widths="equal">
                    <Grid.Column>
                      <Form.Field
                        control={DatePicker}
                        minDate={moment(Session.get("campaign").createdAt)}
                        maxDate={moment()}
                        selected={
                          search.dateStart ? moment(search.dateStart) : null
                        }
                        selectsStart
                        startDate={
                          search.dateStart ? moment(search.dateStart) : null
                        }
                        endDate={search.dateEnd ? moment(search.dateEnd) : null}
                        onChange={value => {
                          if (value && value._isAMomentObject) {
                            this._handleSearchChange(null, {
                              name: "dateStart",
                              value: value.toDate()
                            });
                          } else {
                            this._handleSearchChange(null, {
                              name: "dateStart",
                              value: false
                            });
                          }
                        }}
                        placeholderText="From date"
                        name="dateStart"
                      />
                    </Grid.Column>
                    <Grid.Column>
                      <Form.Field
                        control={DatePicker}
                        minDate={moment(Session.get("campaign").createdAt)}
                        maxDate={moment()}
                        selected={
                          search.dateEnd ? moment(search.dateEnd) : null
                        }
                        selectsEnd
                        startDate={
                          search.dateStart ? moment(search.dateStart) : null
                        }
                        endDate={search.dateEnd ? moment(search.dateEnd) : null}
                        onChange={value => {
                          if (value && value._isAMomentObject) {
                            this._handleSearchChange(null, {
                              name: "dateEnd",
                              value: value.toDate()
                            });
                          } else {
                            this._handleSearchChange(null, {
                              name: "dateEnd",
                              value: false
                            });
                          }
                        }}
                        placeholderText="To date"
                        name="dateEnd"
                      />
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Grid.Column>
              <Grid.Column />
            </Grid.Row>
          ) : null}
        </Grid>
        <p className="more-options">
          <a href="javascript:void(0);" onClick={this._handleMoreOptionsClick}>
            {moreOptions ? (
              <span>
                <Icon name="chevron up" />
                Less Options
              </span>
            ) : (
              <span>
                <Icon name="chevron down" />
                More Options
              </span>
            )}
          </a>
        </p>
        <Divider hidden />
        <PeopleSearchContainer
          campaignId={campaignId}
          facebookId={facebookId}
          search={search}
          options={options}
          onChange={this._handleDataChange}
          editMode={editMode}
        />
        <Divider hidden />
        {pageCount ? (
          <Pagination
            activePage={activePage}
            totalPages={pageCount}
            onPageChange={this._handlePageChange}
          />
        ) : null}
      </Wrapper>
    );
  }
}
