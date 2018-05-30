import _ from "underscore";
import React from "react";
import styled from "styled-components";
import PeopleSearchContainer from "/imports/ui/containers/people/PeopleSearchContainer.jsx";
import {
  Segment,
  Form,
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

const Wrapper = styled.div`
  .filter-label {
    text-transform: uppercase;
    color: #999;
    letter-spacing: 0.1rem;
    font-size: 0.8em;
    display: block;
    margin-bottom: 0.5rem;
  }
`;

const flags = [
  {
    name: "Incluencers",
    icon: "certificate",
    prop: "influencer"
  },
  {
    name: "Starred",
    icon: "star",
    prop: "starred"
  },
  {
    name: "Electorate",
    icon: "thumbs up",
    prop: "voteIntent"
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
        accountFilter: "account"
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
  _getPageCount() {
    const { count, options } = this.state;
    if (count) {
      return Math.floor(count / options.limit);
    }
    return 0;
  }
  render() {
    const { activePage, search, options } = this.state;
    const { campaignId, facebookId, editMode } = this.props;
    const pageCount = this._getPageCount();
    return (
      <Wrapper>
        <h3>Find people</h3>
        <Grid columns={4} widths="equal" verticalAlign="middle">
          <Grid.Row>
            <Grid.Column>
              <span className="filter-label">Text search</span>
              <Form.Field
                fluid
                control={Input}
                placeholder="Find anything..."
                name="q"
                onChange={this._handleSearchChange}
              />
            </Grid.Column>
            <Grid.Column>
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
            <Grid.Column>
              <span className="filter-label">Filter</span>
              <Form.Field
                control={Select}
                value={search.accountFilter}
                name="accountFilter"
                onChange={this._handleSearchChange}
                fluid
                options={[
                  {
                    key: "all",
                    value: "all",
                    text: "Show all people"
                  },
                  {
                    key: "import",
                    value: "import",
                    text: "Imported"
                  },
                  {
                    key: "account",
                    value: "account",
                    text: "Only from this page"
                  }
                ]}
              />
            </Grid.Column>
            <Grid.Column>
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
        </Grid>
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
