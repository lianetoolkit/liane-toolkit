import React, { Component } from "react";
import styled, { css } from "styled-components";
import L from "leaflet";
import "leaflet.utfgrid";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

import Page from "../components/Page.jsx";
import Button from "../components/Button.jsx";

const imagePath = "/";
L.Icon.Default.imagePath = imagePath;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/map/marker-icon-2x.png",
  iconUrl: "images/map/marker-icon.png",
  shadowUrl: "images/map/marker-shadow.png"
});

const Container = styled.div`
  .leaflet-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
`;

const Tools = styled.div`
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: 20%;
  z-index: 2;
`;

const Tool = styled.div`
  margin-top: 10px;
  ${props =>
    !props.transparent &&
    css`
      background: #fff;
      border-radius: 7px;
    `}
  .button {
    display: block;
    margin: 0;
  }
`;

export default class MapPage extends Component {
  render() {
    return (
      <Container>
        <Map ref="map" center={[0, 0]} zoom={2} scrollWheelZoom={true}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* {layers.map(layer => (
            <TileLayer key={layer._id} url={layer.tilelayer} />
          ))}
          {children} */}
        </Map>
        <Tools>
          <Tool>
            <p>Tste</p>
          </Tool>
          <Tool transparent>
            <Button>Adicionar ao mapa</Button>
          </Tool>
        </Tools>
      </Container>
    );
  }
}
