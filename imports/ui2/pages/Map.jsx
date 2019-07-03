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
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .leaflet-container {
    flex: 1 1 100%;
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
`;

const MapNav = styled.nav`
  z-index: 2;
  background: #333;
  .nav-content {
    display: flex;
    justify-content: center;
    padding: 1em 0 0;
    font-size: 0.8em;
    font-weight: 600;
  }
  a {
    pointer-events: auto;
    display: inline-block;
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.6);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-bottom: 2px solid transparent;
    &:hover {
      color: #fff;
      border-color: rgba(0, 0, 0, 0.3);
    }
    &.active {
      color: #f7f7f7;
      border-color: #212121;
    }
  }
  ${props =>
    props.attached &&
    css`
      position: relative;
      flex: 0 0 auto;
      width: 100%;
    `}
  ${props =>
    !props.attached &&
    css`
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 65%;
      pointer-events: none;
      background: linear-gradient(
        180deg,
        rgba(0, 0, 0, 0.7) 0%,
        rgba(255, 255, 255, 0) 100%
      );
    `}
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
      padding: 0.75rem 0;
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
    span {
      font-weight: 600;
    }
    span.description {
      font-weight: normal;
      font-size: 0.8em;
      font-style: italic;
      color: #666;
      display: block;
    }
  }
`;

export default class MapPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      map: true
    };
  }
  _handleNavClick = map => ev => {
    ev.preventDefault();
    this.setState({ map });
  };
  _handleAddToMapClick = ev => {
    ev.preventDefault();
    this.setState({
      adding: true
    });
  };
  render() {
    const { map, adding } = this.state;
    return (
      <Container>
        <MapNav attached={!map}>
          <span className="nav-content">
            <a
              href="javascript:void(0);"
              className={!map ? "active" : ""}
              onClick={this._handleNavClick(false)}
            >
              Audiência de território
            </a>
            <a
              href="javascript:void(0);"
              className={map ? "active" : ""}
              onClick={this._handleNavClick(true)}
            >
              Mapa
            </a>
          </span>
        </MapNav>
        {map ? (
          <>
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
                    <FontAwesomeIcon icon="user-circle" />
                    <span>
                      Pessoas
                      <span className="description">
                        Pessoas do diretório que possuem endereço cadastrado
                      </span>
                    </span>
                  </li>
                  <li>
                    <FontAwesomeIcon icon="map-marker" />
                    <span>
                      Marcações da campanha
                      <span className="description">
                        Pontos customizados adicionados pela campanha
                      </span>
                    </span>
                  </li>
                  <li className="disabled">
                    <FontAwesomeIcon icon="globe" />
                    <span>
                      Datapedia
                      <span className="description">
                        Dados de eleições passadas em parceria com Datapedia
                      </span>
                    </span>
                  </li>
                </LayerFilter>
              </Tool>
              <Tool transparent>
                <Button
                  href="javascript:void(0);"
                  onClick={this._handleAddToMapClick}
                >
                  <span className="icon">
                    <FontAwesomeIcon icon="map-marked" />
                  </span>
                  <span className="label">Adicionar ao mapa</span>
                </Button>
                {adding ? (
                  <input type="text" placeholder="Buscar localização..." />
                ) : null}
              </Tool>
            </Tools>
          </>
        ) : null}
      </Container>
    );
  }
}
