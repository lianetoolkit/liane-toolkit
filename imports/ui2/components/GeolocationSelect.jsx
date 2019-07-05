import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Form from "./Form.jsx";

const Container = styled.div`
  margin: 0 0 1rem;
  .results {
    list-style: none;
    margin: 0;
    padding: 0;
    li {
      margin: 0 0 1px;
      cursor: pointer;
      outline: none;
    }
  }
`;

const GeolocationItem = styled.div`
  padding: 1rem;
  background: #fff;
  border-radius: 7px;
  .reset {
    float: right;
    color: #999;
    &:hover {
      color: #333;
    }
  }
  p {
    margin: 0;
    &.display-name {
      color: #999;
      font-style: italic;
      font-size: 0.8em;
    }
  }
`;

export default class GeolocationSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      search: "",
      loading: false
    };
  }
  search = debounce(() => {
    const { country } = this.props;
    const { region, search } = this.state;
    const query = {
      country,
      [region]: search
    };
    this.setState({ loading: true });
    Meteor.call("geolocations.searchNominatim", query, (err, res) => {
      this.setState({ loading: false });
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
  matchGeolocation = (id, type, cb) => {
    const { region } = this.state;
    this.setState({
      loading: true
    });
    Meteor.call(
      "geolocations.matchFromOSM",
      { id, type, regionType: region },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          console.log(err);
          alertStore.add(err);
        }
        if (cb && typeof cb == "function") {
          cb(err, res);
        }
      }
    );
  };
  _handleChange = ({ target }) => {
    this.setState({
      loading: true,
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
      region: target.value,
      results: []
    });
    if (this.state.search) {
      this.search();
    }
  };
  _handleSelect = geolocation => ev => {
    ev.preventDefault();
    const { onChange } = this.props;
    this.matchGeolocation(
      geolocation.osm_id,
      geolocation.osm_type,
      (err, res) => {
        if (res) {
          this.setState({
            selected: geolocation
          });
          if (onChange && typeof onChange == "function") {
            onChange(geolocation);
          }
        }
      }
    );
  };
  _handleReset = () => {
    const { onChange } = this.props;
    this.setState({
      selected: null
    });
    if (onChange && typeof onChange == "function") {
      onChange(null);
    }
  };
  render() {
    const { selected, results, region, search } = this.state;
    return (
      <Container>
        {selected ? (
          <GeolocationItem>
            <a
              href="javascript:void(0);"
              className="reset"
              onClick={this._handleReset}
            >
              <FontAwesomeIcon icon="times" />
            </a>
            <p className="name">
              {selected.namedetails.name}
              {region == "city" ? ", " + selected.address.state : ""}
            </p>
            <p className="display-name">{selected.display_name}</p>
          </GeolocationItem>
        ) : (
          <>
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
                  <li
                    className="geolocation-item"
                    key={item.place_id}
                    tabIndex="-1"
                    onClick={this._handleSelect(item)}
                  >
                    <GeolocationItem>
                      <p className="name">
                        {item.namedetails.name}
                        {region == "city" ? ", " + item.address.state : ""}
                      </p>
                      <p className="display-name">{item.display_name}</p>
                    </GeolocationItem>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </Container>
    );
  }
}
