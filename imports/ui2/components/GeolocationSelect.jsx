import React, { Component } from "react";
import styled from "styled-components";
import { debounce } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Form from "./Form.jsx";

const Container = styled.div`
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      margin: 0 0 1px;
      padding: 1rem;
      background: #fff;
      border-radius: 7px;
      p {
        margin: 0;
        &.display-name {
          color: #999;
          font-style: italic;
          font-size: 0.8em;
        }
      }
    }
  }
`;

export default class GeolocationSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      search: ""
    };
  }
  search = debounce(() => {
    const { country } = this.props;
    const { region, search } = this.state;
    const query = {
      country,
      [region]: search
    };
    Meteor.call("geolocations.searchNominatim", query, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          results: res.filter(
            item => !item.address.village && !item.address.city_district
          )
        });
      }
    });
  }, 300);
  _handleChange = ({ target }) => {
    this.setState({
      search: target.value
    });
    if (target.value) {
      this.search();
    } else {
      this.setState({ results: [] });
    }
  };
  _handleRegionChange = ({ target }) => {
    this.setState({
      region: target.value
    });
    if (this.state.search) {
      this.search();
    }
  };
  render() {
    const { results, region, search } = this.state;
    console.log(results);
    return (
      <Container>
        <label>
          <input
            type="radio"
            name="regionType"
            value="state"
            onChange={this._handleRegionChange}
            checked={region == "state" ? true : false}
          />{" "}
          Estado/Província
        </label>
        <label>
          <input
            type="radio"
            name="regionType"
            value="city"
            onChange={this._handleRegionChange}
            checked={region == "city" ? true : false}
          />{" "}
          Cidade
        </label>
        {region ? (
          <input
            type="text"
            placeholder="Busque por uma localização..."
            value={search}
            onChange={this._handleChange}
          />
        ) : null}
        {results.length ? (
          <ul className="results">
            {results.map(item => (
              <li key={item.place_id}>
                <p className="name">
                  {item.address.city ? item.address.city + ", " : null}
                  {item.address.state} - {item.address.country}
                </p>
                <p className="display-name">{item.display_name}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    );
  }
}
