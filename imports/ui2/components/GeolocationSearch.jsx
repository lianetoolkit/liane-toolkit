import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Form from "./Form.jsx";
import Loading from "./Loading.jsx";

const messages = defineMessages({
  searchPlaceholder: {
    id: "app.geolocation_select.search.placeholder",
    defaultMessage: "Search for a location...",
  },
});

const Container = styled.div`
  margin: 0 0 1rem;
  border-radius: 7px;
  padding: 1rem;
  border: 1px solid #ddd;
  .select-type {
    display: flex;
    justify-content: space-around;
    label {
      margin: 0;
    }
  }
  input[type="text"] {
    margin: 1rem 0 0;
  }
  .results {
    list-style: none;
    margin: 1rem 0 0;
    padding: 0;
    li {
      margin: 0 0 1px;
      cursor: pointer;
      outline: none;
    }
  }
  .selected {
    margin: -1rem;
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

class GeolocationSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: [],
      search: "",
      loading: false,
    };
  }
  componentDidMount() {
    if (this.props.regionType)
      this.setState({
        region: this.props.regionType,
      });
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { region, selected } = this.state;
    if (prevState.region != region) {
      onChange && onChange({ type: region, geolocation: null });
    }
    if (JSON.stringify(prevState.selected) != JSON.stringify(selected)) {
      onChange && onChange({ type: region, geolocation: selected });
    }
  }
  search = debounce(() => {
    const { country } = this.props;
    const { region, search } = this.state;
    if (region == "national") return;
    const query = {
      country,
      [region]: search,
    };
    this.setState({ loading: true });
    Meteor.call("geolocations.searchNominatim", query, (err, res) => {
      this.setState({ loading: false });
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          results: res.filter(
            (item) => !item.address.village && !item.address.city_district
          ),
        });
      }
    });
  }, 300);
  _handleChange = ({ target }) => {
    this.setState({
      loading: true,
      search: target.value,
    });
    if (target.value) {
      this.search();
    } else {
      this.setState({ results: [], loading: false });
    }
  };
  _handleRegionChange = ({ target }) => {
    const { onChange } = this.props;
    this.setState({
      region: target.value,
      selected: null,
      results: [],
    });
    if (this.state.search) {
      this.search();
    }
  };
  _handleSelect = (geolocation) => (ev) => {
    ev.preventDefault();
    const { onChange } = this.props;
    this.setState({
      selected: geolocation,
    });
  };
  _handleReset = () => {
    const { onChange } = this.props;
    this.setState({
      selected: null,
    });
    if (onChange && typeof onChange == "function") {
      onChange({ geolocation: null, type: null });
    }
  };
  render() {
    const { intl } = this.props;
    const { loading, selected, results, region, search } = this.state;
    return (
      <Container>
        {selected ? (
          <GeolocationItem className="selected">
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
            <div className="select-type">
              <label>
                <input
                  type="radio"
                  name="regionType"
                  value="national"
                  onChange={this._handleRegionChange}
                  checked={region == "national" ? true : false}
                />{" "}
                <FormattedMessage
                  id="app.geolocation_select.national.label"
                  defaultMessage="National"
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="regionType"
                  value="state"
                  onChange={this._handleRegionChange}
                  checked={region == "state" ? true : false}
                />{" "}
                <FormattedMessage
                  id="app.geolocation_select.state.label"
                  defaultMessage="State/Province"
                />
              </label>
              <label>
                <input
                  type="radio"
                  name="regionType"
                  value="city"
                  onChange={this._handleRegionChange}
                  checked={region == "city" ? true : false}
                />{" "}
                <FormattedMessage
                  id="app.geolocation_select.city.label"
                  defaultMessage="City"
                />
              </label>
            </div>
            {region && region != "national" ? (
              <input
                type="text"
                placeholder={intl.formatMessage(messages.searchPlaceholder)}
                value={search}
                onChange={this._handleChange}
              />
            ) : null}
            {results.length ? (
              <ul className="results">
                {results.map((item) => (
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
            {loading ? <Loading /> : null}
          </>
        )}
      </Container>
    );
  }
}

GeolocationSearch.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(GeolocationSearch);
