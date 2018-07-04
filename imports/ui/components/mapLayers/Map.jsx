import React from "react";
import styled from "styled-components";
import L from "leaflet";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

const Wrapper = styled.div``;

export default class LayersMap extends React.Component {
  constructor(props) {
    super(props);
  }
  _bounds() {
    const { layers } = this.props;
    let latlngs = [];
    let bounds;
    for (const layer of layers) {
      if (layer.bbox && layer.bbox.length) {
        if (bounds) {
          bounds.extend(L.latLngBounds(layer.bbox[0], layer.bbox[1]));
        } else {
          bounds = L.latLngBounds(layer.bbox[0], layer.bbox[1]);
        }
      }
    }
    return bounds;
  }
  render() {
    const { layers, ...props } = this.props;
    return (
      <Wrapper>
        <Map
          ref="map"
          center={[0, 0]}
          zoom={2}
          scrollWheelZoom={false}
          bounds={this._bounds()}
          style={{
            width: "100%",
            height: "400px"
          }}
          {...props}
        >
          <TileLayer
            opacity={0.5}
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {layers.map(layer => (
            <TileLayer key={layer._id} url={layer.tilelayer} />
          ))}
        </Map>
      </Wrapper>
    );
  }
}
