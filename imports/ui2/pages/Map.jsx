import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
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

import { userCan } from "/imports/ui2/utils/permissions";

import { alertStore } from "../containers/Alerts.jsx";

import EditControl from "../components/EditControl.jsx";
import Loading from "../components/Loading.jsx";
import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";
import Button from "../components/Button.jsx";
import ColorSelector from "../components/ColorSelector.jsx";

import PeopleMapLayer from "../components/PeopleMapLayer.jsx";

import MapLayerSelect from "../components/MapLayerSelect.jsx";

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

const messages = defineMessages({
  formTitle: {
    id: "app.forms.title",
    defaultMessage: "Title"
  },
  formDescription: {
    id: "app.forms.description",
    defaultMessage: "Description"
  },
  formMapLayerLabel: {
    id: "app.map.layer_select_label",
    defaultMessage: "Select or create a map layer"
  },
  formMapLayerReadLabel: {
    id: "app.map.layer_read_label",
    defaultMessage: "Layer"
  },
  formSave: {
    id: "app.forms.save",
    defaultMessage: "Save"
  },
  confirm: {
    id: "app.confirm",
    defaultMessage: "Are you sure?"
  }
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
    .color-selector {
      margin: 0 0 1rem;
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
  .people-icon {
    border: 0;
    i.icon {
      display: block;
      background: #333;
      border-radius: 100%;
      font-size: 18px;
      line-height: 22px;
      text-align: center;
      width: 20px;
      height: 20px;
      margin: 0;
      padding: 0;
      svg path {
        fill: #fff;
      }
      &.yellow-bg {
        svg path {
          fill: #d5d500;
        }
      }
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
    }
    .icon {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 1.625rem 0 0 1.625rem;
      border-right: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.75rem 0;
    }
    .label {
      font-size: 0.8em;
      padding: 0.75rem 0;
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
  > li {
    background: #fff;
    border-bottom: 1px solid #ddd;
    padding: 0.75rem 1rem;
    margin: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    outline: none;
    &:first-child {
      border-radius: 7px 7px 0 0;
    }
    &:last-child {
      border-radius: 0 0 7px 7px;
    }
    svg {
      margin: 0 1rem 0 0;
      flex: 0 0 auto;
    }
    .filter-main-content {
      flex: 1 1 auto;
    }
    &:hover {
      background: #f0f0f0;
    }
    &.disabled {
      color: #999;
    }
    span.filter-title {
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
  li.map-layers-filter {
    display: block;
    .map-layers-list {
      margin: -0.75rem -1rem;
      padding: 0;
      width: auto;
      display: block;
      &.has-filter {
        li {
          color: #999;
          svg {
            color: #999;
          }
          &.active {
            svg {
              color: green;
            }
            color: #000;
          }
        }
      }
      li {
        background: #fff;
        margin: 0;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border-bottom: 1px solid #ddd;
        display: flex;
        align-items: center;
        svg {
          color: #ccc;
        }
        h4 {
          margin: 0;
          font-weight: normal;
        }
        &:last-child {
          border-bottom: 0;
          border-radius: 0 0 7px 7px;
        }
        &:hover {
          background: #f0f0f0;
        }
      }
    }
  }
`;

class MapPage extends Component {
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
      featureLayers: [],
      layers: {
        people: true,
        custom: true
      },
      map: true
    };
  }
  componentDidMount() {
    const { campaign, mapFeatures } = this.props;
    if (campaign.geolocation) {
      const { map } = this.refs;
      const { boundingbox } = campaign.geolocation.osm;
      map.leafletElement.setMaxZoom(19);
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
    const { formData, featureId, layers, featureLayers } = this.state;
    if (JSON.stringify(mapFeatures) != JSON.stringify(prevProps.mapFeatures)) {
      this._renderFeatures();
    }
    if (prevState.featureId && featureId != prevState.featureId) {
      this._renderFeatures();
    }
    if (layers.custom != prevState.layers.custom) {
      this._renderFeatures();
    }
    if (prevState.featureLayers != featureLayers) {
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
    const { intl } = this.props;
    const { featureId } = this.state;
    if (confirm(intl.formatMessage(messages.confirm))) {
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
    const { featureLayers, layers } = this.state;
    if (this.refs.featureGroup) {
      const layerGroup = this.refs.featureGroup.leafletElement;
      layerGroup.clearLayers();
      if (!layers.custom) return;
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
        if (
          !featureLayers.length ||
          featureLayers.indexOf(properties.mapLayerId) !== -1 ||
          !properties.mapLayerId
        )
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
  _handleToggleLayerClick = layer => ev => {
    const { layers } = this.state;
    this.setState({
      layers: {
        ...layers,
        [layer]: !layers[layer]
      }
    });
  };
  _handleFeatureLayerClick = mapLayer => ev => {
    ev.preventDefault();
    const { featureLayers } = this.state;
    if (featureLayers.indexOf(mapLayer._id) == -1) {
      this.setState({
        featureLayers: [...featureLayers, mapLayer._id]
      });
    } else {
      this.setState({
        featureLayers: [...featureLayers].filter(l => l != mapLayer._id)
      });
    }
  };
  _handlePeopleMouseOver = person => {
    this.setState({
      hoveringPerson: person
    });
  };
  _handlePeopleMouseOut = person => {
    this.setState({
      hoveringPerson: false
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
    const { intl, mapFeatures, mapLayers, people } = this.props;
    const {
      loading,
      featureLayers,
      layers,
      map,
      featureId,
      hoveringFeatureId,
      hoveringPerson
    } = this.state;
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
        {/* <MapNav attached={!map}>
          <span className="nav-content">
            <a
              href="javascript:void(0);"
              // className={!map ? "active" : ""}
              className="disabled"
              // onClick={this._handleNavClick(false)}
            >
              <FormattedMessage
                id="app.map.nav.territory"
                defaultMessage="Territory Audience"
              />{" "}
              (<FormattedMessage id="app.soon" defaultMessage="soon" />)
            </a>
            <a
              href="javascript:void(0);"
              className={map ? "active" : ""}
              onClick={this._handleNavClick(true)}
            >
              <FormattedMessage id="app.map.nav.map" defaultMessage="Map" />
            </a>
          </span>
        </MapNav> */}
        {map ? (
          <>
            <Map ref="map" center={[0, 0]} zoom={2} scrollWheelZoom={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                opacity={0.75}
              />
              <FeatureGroup ref="featureGroup">
                {userCan("edit", "map") ? (
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
                ) : null}
              </FeatureGroup>
              {layers.people ? (
                <PeopleMapLayer
                  people={people}
                  onMouseOver={this._handlePeopleMouseOver}
                  onMouseOut={this._handlePeopleMouseOut}
                />
              ) : null}
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
              {hoveringPerson ? (
                <Tool>
                  <div className="hover-feature">
                    <h3>{hoveringPerson.name}</h3>
                    <p>{hoveringPerson.location.formattedAddress}</p>
                  </div>
                </Tool>
              ) : null}
              <Tool>
                <LayerFilter>
                  <li
                    onClick={this._handleToggleLayerClick("people")}
                    tabIndex="-1"
                    className={!layers.people ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="user-circle" />
                    <span className="filter-main-content">
                      <span className="filter-title">
                        <FormattedMessage
                          id="app.map.filters.people.title"
                          defaultMessage="People"
                        />
                      </span>
                      <span className="description">
                        <FormattedMessage
                          id="app.map.filters.people.description"
                          defaultMessage="People from the directory that have registered address"
                        />
                      </span>
                    </span>
                  </li>
                  <li
                    onClick={this._handleToggleLayerClick("custom")}
                    tabIndex="-1"
                    className={!layers.custom ? "disabled" : ""}
                  >
                    <FontAwesomeIcon icon="map-marker" />
                    <span className="filter-main-content">
                      <span className="filter-title">
                        <FormattedMessage
                          id="app.map.filters.custom.title"
                          defaultMessage="Campaign additions"
                        />
                      </span>
                      <span className="description">
                        <FormattedMessage
                          id="app.map.filters.custom.description"
                          defaultMessage="Custom map features added by the campaign"
                        />
                      </span>
                    </span>
                  </li>
                  {mapLayers && mapLayers.length ? (
                    <li className="map-layers-filter">
                      <ul
                        className={`map-layers-list ${
                          featureLayers.length ? "has-filter" : ""
                        }`}
                      >
                        {mapLayers.map(mapLayer => (
                          <li
                            key={mapLayer._id}
                            onClick={this._handleFeatureLayerClick(mapLayer)}
                            className={
                              featureLayers.indexOf(mapLayer._id) != -1
                                ? "active"
                                : ""
                            }
                          >
                            <FontAwesomeIcon
                              icon={
                                featureLayers.indexOf(mapLayer._id) != -1
                                  ? "toggle-on"
                                  : "toggle-off"
                              }
                            />
                            <h4>{mapLayer.title}</h4>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ) : null}
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
              {mapFeatures.length && userCan("export", "map") ? (
                <Tool transparent>
                  <Button href="javascript:void(0);" onClick={this._export}>
                    <span className="icon">
                      <FontAwesomeIcon icon="map-marked" />
                    </span>
                    <span className="label">
                      <FormattedMessage
                        id="app.map.export"
                        defaultMessage="Export campaign additions"
                      />
                    </span>
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
                    placeholder={intl.formatMessage(messages.formTitle)}
                    name="title"
                    value={this.getFeatureValue("title")}
                    onChange={this._handleFeatureChange}
                    disabled={!userCan("edit", "map")}
                  />
                  <textarea
                    placeholder={intl.formatMessage(messages.formDescription)}
                    name="description"
                    value={this.getFeatureValue("description")}
                    onChange={this._handleFeatureChange}
                    disabled={!userCan("edit", "map")}
                  />
                  {userCan("edit", "map") ? (
                    <ColorSelector
                      name="color"
                      value={this.getFeatureValue("color")}
                      onChange={this._handleFeatureChange}
                    />
                  ) : null}
                  <Form.Field
                    label={intl.formatMessage(
                      userCan("edit", "map")
                        ? messages.formMapLayerLabel
                        : messages.formMapLayerReadLabel
                    )}
                  >
                    <MapLayerSelect
                      name="mapLayerId"
                      value={this.getFeatureValue("mapLayerId")}
                      onChange={this._handleFeatureChange}
                      disabled={!userCan("edit", "map")}
                    />
                  </Form.Field>
                  {userCan("edit", "map") ? (
                    <div className="actions">
                      <a
                        className="button delete"
                        onClick={this._handleRemoveClick}
                      >
                        <FormattedMessage
                          id="app.forms.remove"
                          defaultMessage="Remove"
                        />
                      </a>
                      <input
                        type="submit"
                        value={intl.formatMessage(messages.formSave)}
                      />
                    </div>
                  ) : null}
                </Form>
              </div>
            ) : null}
          </>
        ) : null}
      </Container>
    );
  }
}

MapPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(MapPage);
