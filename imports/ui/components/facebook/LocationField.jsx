import React from "react";
import { Form, Dropdown, Header, List } from "semantic-ui-react";
import _ from "underscore";

export default class LocationField extends React.Component {
  static defaultProps = {
    value: {
      country: {},
      region: {},
      city: {}
    },
    types: ["region", "city"]
  };
  constructor(props) {
    super(props);
    this.state = {
      value: {
        country: "",
        region: "",
        city: ""
      },
      availableGeolocations: {
        country: {},
        region: {},
        city: {}
      },
      region: "",
      city: ""
    };
    this._handleChange = this._handleChange.bind(this);
    this._search = this._search.bind(this);
    this._searchGeolocations = this._searchGeolocations.bind(this);
  }
  componentDidMount() {
    if (this.props.value) {
      this._updateAvailableGeolocations(this.props.value);
      this.setState({
        value: this._parseValueInput(this.props.value)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this._updateAvailableGeolocations(nextProps.value);
      this.setState({
        value: this._parseValueInput(nextProps.value)
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState.value) != JSON.stringify(value) && onChange) {
      onChange(null, { name, value: this._parseValueOutput(value) });
    }
  }
  _resetByType(type, ret) {
    let newState = {
      availableGeolocations: {
        ...this.state.availableGeolocations,
        [type]: {}
      },
      value: {
        ...this.state.value,
        [type]: ""
      }
    };
    if (ret) {
      return newState;
    } else {
      this.setState(newState);
    }
  }
  _parseValueInput(value) {
    const { types } = this.props;
    if (!value) return defaultProps.value;
    let input = {};
    for (const type of types) {
      input[type] = value[type] ? JSON.stringify(value[type]) : "";
    }
    return input;
  }
  _parseValueOutput(value) {
    const { types } = this.props;
    if (!value) return defaultProps.value;
    let output = {};
    for (const type of types) {
      output[type] = value[type] ? JSON.parse(value[type]) : "";
    }
    return output;
  }
  _updateAvailableGeolocations(data = []) {
    if (typeof data == "object") {
      data = Object.values(data);
    }
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let geolocations = {
        country: {},
        region: {},
        city: {}
      };
      data.forEach(geolocation => {
        if (geolocation.type && geolocations[geolocation.type]) {
          let str = JSON.stringify(geolocation);
          geolocations[geolocation.type][geolocation.key] = {
            key: geolocation.key,
            value: str,
            text: geolocation.name,
            content: this._getContent(geolocation)
          };
        }
      });
      this.setState({
        availableGeolocations: Object.assign(
          {},
          {
            country: {
              ...this.state.availableGeolocations.country,
              ...geolocations.country
            },
            region: {
              ...this.state.availableGeolocations.region,
              ...geolocations.region
            },
            city: {
              ...this.state.availableGeolocations.city,
              ...geolocations.city
            }
          }
        )
      });
    }
  }
  _search = _.debounce((type, data) => {
    const { types } = this.props;
    const { value } = this.state;
    let query, parent;
    if (type == "region" && types.indexOf("country") !== -1) {
      parent = JSON.parse(value.country);
    }
    if (type == "city" && types.indexOf("region") !== -1) {
      parent = JSON.parse(value.region);
    }
    query = { q: data.searchQuery, location_types: [type] };
    if (parent) {
      if (parent.type == "country") {
        query.country_code = parent.key;
      } else if (parent.type == "region") {
        query.region_id = parent.key;
      }
    }
    if (query.q) {
      Meteor.call("geolocations.searchAdGeolocations", query, (error, res) => {
        if (error) {
          console.log(error);
        } else {
          this._updateAvailableGeolocations(res.data);
        }
      });
    }
  }, 200);
  _searchGeolocations = type => (ev, data) => {
    this._search(type, data);
  };
  _handleChange = type => (e, { name, value }) => {
    let newState = { ...this.state.value };
    let { region, city } = this.state.value;
    if (type == "country") {
      if (region && JSON.parse(region).country_code != JSON.parse(value).key) {
        newState = this._resetByType("region");
      }
      if (city && JSON.parse(city).country_code != JSON.parse(value).key) {
        newState = this._resetByType("city");
      }
    } else if (type == "region") {
      if (
        city &&
        parseInt(JSON.parse(city).region_id) != parseInt(JSON.parse(value).key)
      ) {
        newState = this._resetByType("city");
      }
    }
    this.setState({
      value: {
        ...newState,
        [type]: value
      }
    });
  };
  _getContent(geolocation) {
    let description = `Type: ${geolocation.type}`;
    if (geolocation.region) {
      description += ` Region: ${geolocation.region}`;
    }
    if (geolocation.country_code) {
      description += ` Country code: ${geolocation.country_code}`;
    }
    return (
      <div>
        <Header content={geolocation.name} subheader={`${geolocation.type}`} />
        <List horizontal>
          {geolocation.region ? (
            <List.Item>{geolocation.region}</List.Item>
          ) : (
            ""
          )}
          {geolocation.country_name ? (
            <List.Item>{geolocation.country_name}</List.Item>
          ) : (
            ""
          )}
        </List>
      </div>
    );
  }
  render() {
    const { types } = this.props;
    let { value } = this.state;
    const { availableGeolocations } = this.state;
    const options = {
      country: Object.values(availableGeolocations.country),
      region: Object.values(availableGeolocations.region),
      city: Object.values(availableGeolocations.city)
    };
    return (
      <div>
        {types.indexOf("country") !== -1 ? (
          <Form.Field
            control={Dropdown}
            options={options.country}
            label="Country"
            placeholder="Search a Facebook country"
            search
            selection
            fluid
            autoComplete="off"
            value={value.country}
            onSearchChange={this._searchGeolocations("country")}
            onChange={this._handleChange("country")}
          />
        ) : null}
        {types.indexOf("region") !== -1 ? (
          <Form.Field
            control={Dropdown}
            options={options.region}
            placeholder="Search a Facebook region"
            label="Region"
            search
            selection
            fluid
            autoComplete="off"
            disabled={types.indexOf("country") !== -1 && !value.country}
            value={value.region}
            onSearchChange={this._searchGeolocations("region")}
            onChange={this._handleChange("region")}
          />
        ) : null}
        {types.indexOf("city") !== -1 ? (
          <Form.Field
            control={Dropdown}
            options={options.city}
            placeholder="Search a Facebook city"
            label="City"
            search
            selection
            fluid
            autoComplete="off"
            disabled={types.indexOf("region") !== -1 && !value.region}
            value={value.city}
            onSearchChange={this._searchGeolocations("city")}
            onChange={this._handleChange("city")}
          />
        ) : null}
      </div>
    );
  }
}
