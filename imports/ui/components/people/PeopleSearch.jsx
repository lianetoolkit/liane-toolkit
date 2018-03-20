import _ from "underscore";
import React from "react";
import styled from "styled-components";
import PeopleSearchContainer from "/imports/ui/containers/people/PeopleSearchContainer.jsx";
import {
  Segment,
  Form,
  Input,
  Select,
  Grid,
  Popup,
  Icon,
  Button,
  Divider
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
      search: {
        name: ""
      },
      options: {
        limit: 10,
        skip: 0,
        props: {
          sortBy: "name",
          facebookId: props.facebookId,
          campaignId: props.campaignId
        }
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
        options: {
          ...options,
          props: {
            ...options.props,
            facebookId: nextProps.facebookId
          }
        }
      });
    }
  }
  _toggleMeta = prop => {
    return () => {
      const { options } = this.state;
      if (!options.props[`campaignMeta.${prop}`]) {
        this.setState({
          options: {
            ...options,
            props: {
              ...options.props,
              [`campaignMeta.${prop}`]: true
            }
          }
        });
      } else {
        let newProps = { ...options.props };
        delete newProps[`campaignMeta.${prop}`];
        this.setState({
          options: {
            ...options,
            props: newProps
          }
        });
      }
    };
  };
  _handleSearchChange = _.debounce((ev, { name, value }) => {
    this.setState({ search: { ...this.state.search, [name]: value } });
  }, 250);
  _handleOptionChange = _.debounce((ev, { name, value }) => {
    this.setState({ options: { ...this.state.options, [name]: value } });
  }, 250);
  _handleSortChange = _.debounce((ev, { value }) => {
    const { options } = this.state;
    this.setState({
      options: {
        ...options,
        props: { ...options.props, sortBy: value }
      }
    });
  }, 250);
  render() {
    const { search, options } = this.state;
    const { campaignId, facebookId } = this.props;
    return (
      <Wrapper>
        <h3>Find people</h3>
        <Grid columns={3} widths="equal">
          <Grid.Row>
            <Grid.Column>
              <span className="filter-label">Search by name</span>
              <Form.Field
                fluid
                control={Input}
                placeholder="Type a name..."
                name="name"
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
                        active={options.props[`campaignMeta.${flag.prop}`]}
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
              <span className="filter-label">Sorting</span>
              <Form.Field
                control={Select}
                onChange={this._handleSortChange}
                value={options.props.sortBy}
                fluid
                options={[
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
                    value: "reactions",
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
        />
      </Wrapper>
    );
  }
}
