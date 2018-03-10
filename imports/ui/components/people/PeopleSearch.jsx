import _ from "underscore";
import React from "react";
import styled from "styled-components";
import PeopleSearchContainer from "/imports/ui/containers/people/PeopleSearchContainer.jsx";
import {
  Segment,
  Form,
  Input,
  Grid,
  Popup,
  Icon,
  Button
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
      search: {}
    };
    this._handleChange = this._handleChange.bind(this);
    this._toggleMeta = this._toggleMeta.bind(this);
  }
  _toggleMeta = prop => {
    return () => {
      const { search } = this.state;
      if (!search[prop]) {
        this.setState({
          search: {
            ...search,
            [prop]: true
          }
        });
      } else {
        this.setState({
          search: {
            ...search,
            [prop]: null
          }
        });
      }
    };
  };
  _handleChange = _.debounce((ev, { name, value }) => {
    this.setState({ search: { ...this.state.search, [name]: value } });
  }, 250);
  render() {
    const { search } = this.state;
    const { campaignId, facebookId } = this.props;
    return (
      <Wrapper>
        <h3>Find people</h3>
        <Grid columns={2} widths="equal">
          <Grid.Row>
            <Grid.Column>
              <span className="filter-label">Search by name</span>
              <Form.Field
                fluid
                control={Input}
                placeholder="Type a name..."
                name="name"
                onChange={this._handleChange}
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
                        active={search[flag.prop]}
                        icon={flag.icon}
                        onClick={this._toggleMeta(flag.prop)}
                      />
                    }
                    content={flag.name}
                  />
                ))}
              </Button.Group>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        <PeopleSearchContainer
          search={search}
          campaignId={campaignId}
          facebookId={facebookId}
        />
      </Wrapper>
    );
  }
}
