import React from "react";
import {
  Grid,
  Button,
  Table,
  Dropdown,
  Message,
  Header,
  List
} from "semantic-ui-react";

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
    console.log(this.props);
    if (this.props.value) {
      this._updateAvailableGeolocations(this.props.value);
      this.setState({
        value: JSON.stringify(this.props.value)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    console.log(nextProps);
    if (this.props.value !== nextProps.value) {
      this.setState({
        value: JSON.stringify(nextProps.value)
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState.value) != JSON.stringify(value)) {
      onChange(null, { name, value: JSON.parse(value) });
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
    const { value, availableGeolocations } = this.state;
    const geolocationOptions = Object.values(availableGeolocations);
    return (
      <Dropdown
        options={geolocationOptions}
        placeholder="Search a Facebook geolocation"
        name="geolocation"
        search
        selection
        fluid
        value={value}
        onSearchChange={this._searchGeolocations}
        onChange={this._handleChange}
      />
    );
  }
}
