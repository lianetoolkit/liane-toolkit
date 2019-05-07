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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
  .button {
    display: block;
    margin: 0;
  }
`;

const LayerFilter = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.8em;
  li {
    background: #fff;
    border-bottom: 1px solid #ddd;
    padding: 0.75rem 1rem;
    margin: 0;
    display: flex;
    align-items: center;
    &:first-child {
      border-radius: 7px 7px 0 0;
    }
    &:last-child {
      border-radius: 0 0 7px 7px;
    }
    svg {
      margin: 0 1rem 0 0;
    }
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
            <LayerFilter>
              <li>
                <FontAwesomeIcon icon="map-marker" />
                <span>Pessoas</span>
              </li>
              <li>
                <FontAwesomeIcon icon="map-marker" />
                <span>Datapedia</span>
              </li>
              <li>
                <FontAwesomeIcon icon="map-marker" />
                <span>Marcações da campanha</span>
              </li>
            </LayerFilter>
          </Tool>
          <Tool transparent>
            <Button>Adicionar ao mapa</Button>
          </Tool>
        </Tools>
      </Container>
    );
  }
}
