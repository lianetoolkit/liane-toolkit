import React from "react";
import { Form, Header, List, Dropdown } from "semantic-ui-react";

export default class SelectGeolocationNominatim extends React.Component {
  static defaultProps = {
    value: ""
  };
  constructor(props) {
    super(props);
    this.state = {
      searchQuery: "",
      availableGeolocations: {},
      value: ""
    };
  }
  componentDidMount() {
    if (this.props.value) {
      this._updateAvailableGeolocations(this.props.value);
      this.setState({
        value: JSON.stringify(this.props.value)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this._updateAvailableGeolocations(nextProps.value);
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
    return (
      <div>
        <Header content={geolocation.display_name} />
        <List />
      </div>
    );
  }
  _searchGeolocations = _.debounce(data => {
    if (data.searchQuery) {
      Meteor.call(
        "geolocations.searchNominatim",
        { q: data.searchQuery },
        (error, data) => {
          if (error) {
            console.log(error);
          } else {
            this._updateAvailableGeolocations(data);
          }
        }
      );
    }
  }, 200);
  _handleSearchChange = (ev, data) => {
    this.setState({ searchQuery: data.searchQuery });
    this._searchGeolocations(data);
  };
  _updateAvailableGeolocations(data = []) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let geolocations = {};
      data.forEach(geolocation => {
        let str = JSON.stringify(geolocation);
        geolocations[geolocation.osm_id] = {
          key: geolocation.osm_id,
          value: str,
          text: geolocation.display_name,
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
  _handleChange = (e, { name, value }) =>
    this.setState({ value, searchQuery: "" });
  render() {
    const { searchQuery, value, availableGeolocations } = this.state;
    const geolocationOptions = Object.values(availableGeolocations);
    return (
      <Form.Field
        control={Dropdown}
        options={geolocationOptions}
        placeholder="Search a location on the OSM database"
        name="geolocation"
        search
        selection
        fluid
        searchQuery={searchQuery}
        value={value}
        onSearchChange={this._handleSearchChange}
        onChange={this._handleChange}
      />
    );
  }
}
