import React, { Component } from "react";
import styled, { css } from "styled-components";
import { get, omit } from "lodash";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  FeatureGroup,
  Circle,
  GeoJSON
} from "react-leaflet";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

import EditControl from "../components/EditControl.jsx";
import Loading from "../components/Loading.jsx";
import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import ColorSelector from "../components/ColorSelector.jsx";

const imagePath = "/";
L.Icon.Default.imagePath = imagePath;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "images/map-marker.svg",
  iconUrl: "images/map-marker.svg",
  iconSize: [20, 27],
  iconAnchor: [10, 26],
  popupAnchor: [0, -10],
  shadowUrl: ""
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
    background: #fff;
    .campaign-marker-icon {
      svg {
        width: 100%;
        height: auto;
      }
    }
  }
  .feature {
    position: absolute;
    z-index: 2;
    right: 0;
    top: 10%;
    background: #fff;
    border-radius: 7px 0 0 7px;
    padding: 1rem 2rem 1rem 1rem;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.2);
    width: 20%;
    min-width: 240px;
    input[type="text"],
    textarea {
      width: 100%;
    }
    .close {
      position: absolute;
      top: 1rem;
      right: 0.6rem;
      color: #333;
      font-size: 0.8em;
    }
    .actions {
      font-size: 0.8em;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      .delete {
        display: block;
        font-size: 0.8em;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }
      input[type="submit"] {
        display: block;
      }
    }
  }
  .hover-feature {
    background: #fff;
    padding: 1rem;
    border-radius: 7px;
    font-size: 0.8em;
    h3 {
      margin: 0;
    }
    p {
      margin: 0;
    }
    .color {
      display: block;
      float: right;
      border-radius: 100%;
      width: 10px;
      height: 10px;
      border: 1px solid rgba(255, 255, 255, 0.5);
    }
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
    &.disabled {
      color: rgba(255, 255, 255, 0.6);
      border-color: transparent;
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
  static icon = (props = {}) => {
    const marker = `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker" class="svg-inline--fa fa-map-marker fa-w-12" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="${props.color ||
      "#000"}" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"></path></svg>`;
    return L.divIcon({
      html: marker,
      iconSize: [20, 27],
      iconAnchor: [10, 26],
      popupAnchor: [0, -10],
      className: "campaign-marker-icon"
    });
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {},
      map: true
    };
  }
  componentDidMount() {
    const { campaign, mapFeatures } = this.props;
    if (campaign.geolocation) {
      const { map } = this.refs;
      const { boundingbox } = campaign.geolocation.osm;
      map.leafletElement.fitBounds([
        [boundingbox[0], boundingbox[2]],
        [boundingbox[1], boundingbox[3]]
      ]);
    }
    if (mapFeatures && mapFeatures.length) {
      // Wait for ref
      setTimeout(() => {
        this._renderFeatures();
      }, 200);
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { mapFeatures } = this.props;
    const { formData, featureId } = this.state;
    if (JSON.stringify(mapFeatures) != JSON.stringify(prevProps.mapFeatures)) {
      this._renderFeatures();
    }
    if (prevState.featureId && featureId != prevState.featureId) {
      this._renderFeatures();
    }
    if (formData.color && prevState.formData.color != formData.color) {
      this._updateFeatureStyle();
    }
  }
  _getCenter() {
    const { campaign } = this.props;
    return [
      get(campaign, "geolocation.osm.lat") || 0,
      get(campaign, "geolocation.osm.lon") || 0
    ];
  }
  _handleMount = drawControl => {};
  _handleNavClick = map => ev => {
    ev.preventDefault();
    this.setState({ map });
  };
  getType = type => {
    switch (type) {
      case "Point":
        return "point";
      case "LineString":
        return "line";
      case "Polygon":
        return "polygon";
    }
  };
  getGeoJSON = () => {
    const { mapFeatures } = this.props;
    return {
      type: "FeatureCollection",
      features: (mapFeatures || []).map(feature => {
        let geojsonFeature = {
          type: "Feature",
          properties: omit(feature, "geometry", "campaignId"),
          geometry: feature.geometry
        };
        if (feature.color) {
          switch (feature.type) {
            case "polygon":
              geojsonFeature.style = {
                fill: feature.color,
                stroke: feature.color
              };
              geojsonFeature.properties.fill = feature.color;
              geojsonFeature.properties.stroke = feature.color;
              break;
            case "point":
              geojsonFeature.style = { fill: feature.color };
              geojsonFeature.properties["marker-color"] = feature.color;
              break;
            case "line":
              geojsonFeature.style = { stroke: feature.color };
              geojsonFeature.properties.stroke = feature.color;
              break;
          }
        }
        return geojsonFeature;
      })
    };
  };
  _export = () => {
    const { campaign } = this.props;
    const geojson = this.getGeoJSON();
    const text = JSON.stringify(geojson);
    const fileName = `${campaign.name}-map.geojson`;
    const fileType = "application/geo+json";
    var blob = new Blob([text], { type: fileType });
    let a = document.createElement("a");
    a.download = fileName;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() {
      URL.revokeObjectURL(a.href);
    }, 1500);
  };
  _handleFeatureCreate = ev => {
    const { campaign } = this.props;
    const geojson = ev.layer.toGeoJSON();
    this.setState({ loading: true });
    Meteor.call(
      "mapFeatures.create",
      {
        campaignId: campaign._id,
        type: this.getType(geojson.geometry.type),
        geometry: geojson.geometry
      },
      (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            featureId: res,
            formData: {}
          });
        }
      }
    );
    return false;
  };
  _handleFeatureEdit = ev => {
    ev.layers.eachLayer(layer => {
      const id = get(layer, "feature.properties._id");
      if (id) {
        this.setState({ loading: true });
        Meteor.call(
          "mapFeatures.update",
          {
            id,
            geometry: layer.toGeoJSON().geometry
          },
          (err, res) => {
            this.setState({ loading: false });
            if (err) {
              alertStore.add(err);
            }
          }
        );
      }
    });
  };
  _handleRemoveClick = () => {
    const { featureId } = this.state;
    if (confirm("Tem certeza?")) {
      Meteor.call("mapFeatures.remove", { id: featureId }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            featureId: false,
            formData: {}
          });
        }
      });
    }
  };
  _handleCloseClick = () => {
    this.setState({
      featureId: false,
      formData: {}
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData, featureId } = this.state;
    Meteor.call(
      "mapFeatures.update",
      { ...formData, id: featureId },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        }
      }
    );
  };
  _renderFeatures = () => {
    if (this.refs.featureGroup) {
      const layerGroup = this.refs.featureGroup.leafletElement;
      layerGroup.clearLayers();
      const geojson = new L.GeoJSON(this.getGeoJSON());
      geojson.eachLayer(layer => {
        const properties = layer.feature.properties;
        if (properties.type == "point") {
          layer.setIcon(MapPage.icon(properties));
        }
        if (properties.color) {
          if ("setStyle" in layer) {
            layer.setStyle({ color: properties.color });
          }
        }
        if (properties.title || properties.description) {
          layer.on("mouseover", () => {
            this.setState({
              hoveringFeatureId: properties._id
            });
          });
          layer.on("mouseout", () => {
            this.setState({
              hoveringFeatureId: false
            });
          });
        }
        layer.on("click", () => {
          this.setState({
            featureId: properties._id,
            formData: {}
          });
        });
        layerGroup.addLayer(layer);
      });
    }
  };
  _handleFeatureChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  _updateFeatureStyle = () => {
    const { featureId } = this.state;
    this.refs.featureGroup.leafletElement.eachLayer(layer => {
      if (layer.feature.properties._id == featureId) {
        if ("setStyle" in layer) {
          layer.setStyle({ color: this.getFeatureValue("color") });
        } else if (layer._icon) {
          layer._icon
            .querySelectorAll("path")[0]
            .setAttribute("fill", this.getFeatureValue("color"));
        }
      }
    });
  };
  getFeatureValue = fieldName => {
    const { mapFeatures } = this.props;
    const { formData, featureId } = this.state;
    if (featureId) {
      const feature = mapFeatures.find(f => f._id == featureId);
      return get(formData, fieldName) || get(feature, fieldName) || "";
    }
  };
  render() {
    const { mapFeatures } = this.props;
    const { loading, map, featureId, hoveringFeatureId } = this.state;
    let feature = false;
    if (featureId) {
      feature = mapFeatures.find(f => f._id == featureId);
    }
    let hoveringFeature = false;
    if (hoveringFeatureId) {
      hoveringFeature = mapFeatures.find(f => f._id == hoveringFeatureId);
    }
    return (
      <Container>
        {loading ? <Loading full /> : null}
        <MapNav attached={!map}>
          <span className="nav-content">
            <a
              href="javascript:void(0);"
              // className={!map ? "active" : ""}
              className="disabled"
              // onClick={this._handleNavClick(false)}
            >
              Audiência de território (em breve)
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
                opacity={0.75}
              />
              <FeatureGroup ref="featureGroup">
                <EditControl
                  position="bottomright"
                  onMounted={this._handleMount}
                  onEdited={this._handleFeatureEdit}
                  onCreated={this._handleFeatureCreate}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false
                  }}
                  edit={{ remove: false }}
                  addOnCreate={false}
                />
              </FeatureGroup>
              {/* {layers.map(layer => (
              <TileLayer key={layer._id} url={layer.tilelayer} />
            ))}
            {children} */}
            </Map>
            <Tools>
              {hoveringFeature ? (
                <Tool>
                  <div className="hover-feature">
                    {hoveringFeature.color ? (
                      <span
                        className="color"
                        style={{ backgroundColor: hoveringFeature.color }}
                      />
                    ) : null}
                    {hoveringFeature.title ? (
                      <h3>{hoveringFeature.title}</h3>
                    ) : null}
                    {hoveringFeature.description ? (
                      <p>{hoveringFeature.description}</p>
                    ) : null}
                  </div>
                </Tool>
              ) : null}
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
                  {/* <li className="disabled">
                    <FontAwesomeIcon icon="globe" />
                    <span>
                      Datapedia
                      <span className="description">
                        Dados de eleições passadas em parceria com Datapedia
                      </span>
                    </span>
                  </li> */}
                </LayerFilter>
              </Tool>
              {mapFeatures.length ? (
                <Tool transparent>
                  <Button href="javascript:void(0);" onClick={this._export}>
                    <span className="icon">
                      <FontAwesomeIcon icon="map-marked" />
                    </span>
                    <span className="label">Exportar marcações</span>
                  </Button>
                </Tool>
              ) : null}
            </Tools>
            {feature ? (
              <div className="feature">
                <a
                  href="javascript:void(0);"
                  className="close"
                  onClick={this._handleCloseClick}
                >
                  <FontAwesomeIcon icon="times" />
                </a>
                <Form onSubmit={this._handleSubmit}>
                  <input
                    type="text"
                    placeholder="Título"
                    name="title"
                    value={this.getFeatureValue("title")}
                    onChange={this._handleFeatureChange}
                  />
                  <textarea
                    placeholder="Descrição"
                    name="description"
                    value={this.getFeatureValue("description")}
                    onChange={this._handleFeatureChange}
                  />
                  <ColorSelector
                    name="color"
                    value={this.getFeatureValue("color")}
                    onChange={this._handleFeatureChange}
                  />
                  <div className="actions">
                    <a
                      className="button delete"
                      onClick={this._handleRemoveClick}
                    >
                      Remover
                    </a>
                    <input type="submit" value="Salvar alterações" />
                  </div>
                </Form>
              </div>
            ) : null}
          </>
        ) : null}
      </Container>
    );
  }
}
