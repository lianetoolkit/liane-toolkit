import React from "react";
import { Form, Dropdown, Header, List } from "semantic-ui-react";

export default class SelectGeolocationFacebook extends React.Component {
  static defaultProps = {
    value: ""
  };
  constructor(props) {
    super(props);
    this.state = {
      availableGeolocations: {},
      value: ""
    };
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
  _parseValueInput(value) {
    if (!value) return "";
    if (Array.isArray(value)) {
      return value.map(item => JSON.stringify(item));
    } else {
      return JSON.stringify(value);
    }
  }
  _parseValueOutput(value) {
    if (Array.isArray(value)) {
      return value.map(item => JSON.parse(item));
    } else {
      return JSON.parse(value);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState.value) != JSON.stringify(value) && onChange) {
      onChange(null, { name, value: this._parseValueOutput(value) });
    }
  }
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
  _searchGeolocations = _.debounce((ev, data) => {
    if (data.searchQuery) {
      Meteor.call(
        "geolocations.searchAdGeolocations",
        { q: data.searchQuery },
        (error, res) => {
          if (error) {
            console.log(error);
          } else {
            this._updateAvailableGeolocations(res.data);
          }
        }
      );
    }
  }, 200);
  _updateAvailableGeolocations(data = []) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let geolocations = {};
      data.forEach(geolocation => {
        let str = JSON.stringify(geolocation);
        geolocations[geolocation.key] = {
          key: geolocation.key,
          value: str,
          text: geolocation.name,
          content: this._getContent(geolocation)
        };
      });
      this.setState({
        availableGeolocations: Object.assign(
          {},
          this.state.availableGeolocations,
          geolocations
        )
      });
    }
  }
  _handleChange = (e, { name, value }) => this.setState({ value });
  render() {
    const { multiple } = this.props;
    let { value } = this.state;
    const { availableGeolocations } = this.state;
    if (multiple) {
      if (value && !Array.isArray(value)) {
        value = [value];
      } else if (!value) {
        value = [];
      }
    }
    const geolocationOptions = Object.values(availableGeolocations);
    return (
      <Form.Field
        control={Dropdown}
        options={geolocationOptions}
        placeholder="Search a Facebook geolocation"
        name="geolocation"
        multiple={multiple || false}
        search
        selection
        fluid
        autoComplete="off"
        value={value}
        onSearchChange={this._searchGeolocations}
        onChange={this._handleChange}
      />
    );
  }
}
