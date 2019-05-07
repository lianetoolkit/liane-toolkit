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

const MapNav = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 65%;
  z-index: 2;
  pointer-events: none;
  background: rgb(0, 0, 0);
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  .nav-content {
    display: flex;
    justify-content: center;
    padding: 1.5em 0 0;
    font-size: 0.8em;
  }
  a {
    pointer-events: auto;
    display: inline-block;
    flex: 0 0 auto;
    color: #ccc;
    text-decoration: none;
    padding: 0.5rem 0;
    margin: 0 2rem;
    font-weight: 600;
    &.active {
      border-bottom: 2px solid #fff;
      color: #fff;
    }
    &:hover {
      color: #fff;
    }
  }
`;

const Tools = styled.div`
  max-width: 300px;
  min-width: 230px;
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
    background: #f60;
    color: #fff;
    border: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: center;
    padding: 0;
    span {
      display: block;
      flex: 1 1 auto;
      text-align: center;
      padding: 0.75rem 1rem;
    }
    .icon {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1.625rem 0 0 1.625rem;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
    .label {
      font-size: 0.8em;
    }
    &:hover,
    &:active,
    &:focus {
      .icon {
        ${"" /* color: rgba(255, 255, 255, 0.5); */}
        background: rgba(0, 0, 0, 0.1);
      }
    }
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
    cursor: pointer;
    &:first-child {
      border-radius: 7px 7px 0 0;
    }
    &:last-child {
      border-radius: 0 0 7px 7px;
    }
    svg {
      margin: 0 1rem 0 0;
    }
    &:hover {
      background: #f0f0f0;
    }
    &.disabled {
      color: #999;
    }
  }
`;

export default class MapPage extends Component {
  render() {
    return (
      <Container>
        <MapNav>
          <span className="nav-content">
            <a href="javascript:void(0);">Audiência de território</a>
            <a href="javascript:void(0);" className="active">
              Mapa
            </a>
          </span>
        </MapNav>
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
                <span>Marcações da campanha</span>
              </li>
              <li className="disabled">
                <FontAwesomeIcon icon="map-marker" />
                <span>Datapedia</span>
              </li>
            </LayerFilter>
          </Tool>
          <Tool transparent>
            <Button>
              <span className="icon">
                <FontAwesomeIcon icon="map-marked" />
              </span>
              <span className="label">Adicionar ao mapa</span>
            </Button>
          </Tool>
        </Tools>
      </Container>
    );
  }
}
