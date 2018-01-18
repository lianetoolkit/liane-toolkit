import React from "react";
import { Form, Header, List } from "semantic-ui-react";
import L from "leaflet";
import { Map, TileLayer, Circle } from "react-leaflet";
// import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";

export default class SelectGeolocationCoordinates extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: [0, 0],
      zoom: 4,
      radius: 50
    };
    this._handleClick = this._handleClick.bind(this);
  }
  componentDidMount() {
    if (this.props.value) {
      this.setState({ ...this.props.value });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.value) !== JSON.stringify(nextProps.value)) {
      this.setState({ ...nextProps.value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState) != JSON.stringify(this.state)) {
      onChange(null, { name, value: { ...this.state } });
    }
  }
  _handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };
  _handleClick(ev) {
    const map = this.refs.map.leafletElement;
    const latlng = ev.latlng;
    this.setState({ center: [latlng.lat, latlng.lng], zoom: map.getZoom() });
  }
  render() {
    const { center, zoom, radius } = this.state;
    return (
      <div className="select-geolocation-coordinates">
        <Form.Input
          label="Radius in kilometers (between 1 and 80)"
          name="radius"
          type="number"
          value={radius}
          onChange={this._handleChange}
        />
        <p>Click on the map to select the center location</p>
        <Map
          ref="map"
          onClick={this._handleClick}
          center={center}
          zoom={zoom}
          style={{
            height: "500px",
            width: "100%"
          }}
        >
          <TileLayer
            attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Circle center={center} radius={radius * 1000} color="#000" />
        </Map>
      </div>
    );
  }
}
