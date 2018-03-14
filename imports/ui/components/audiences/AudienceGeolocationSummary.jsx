import React from "react";
import styled from "styled-components";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import {
  Grid,
  Table,
  Divider,
  Statistic,
  Header,
  Label
} from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

const Wrapper = styled.div`
  &.zoom-0 {
    .geolocation-icon {
      font-size: 0.5em;
    }
  }
  &.zoom-1 {
    .geolocation-icon {
      font-size: 0.8em;
    }
  }
  &.zoom-2,
  &.zoom-3 {
    .geolocation-icon {
      font-size: 1em;
    }
  }
  &.zoom-4 {
    .geolocation-icon {
      font-size: 1.2em;
    }
  }
  &.zoom-5 {
    .geolocation-icon {
      font-size: 1.5em;
    }
  }
  .geolocation-icon {
    text-align: center;
    font-size: 1.8em;
    color: #000;
    span {
      transition: all 0.2s linear;
    }
    &.active {
      color: #fff;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    }
  }
`;

import L from "leaflet";
// const imagePath = "/";
// L.Icon.Default.imagePath = imagePath;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").split(
//     imagePath
//   )[1],
//   iconUrl: require("leaflet/dist/images/marker-icon.png").split(imagePath)[1],
//   shadowUrl: require("leaflet/dist/images/marker-shadow.png").split(
//     imagePath
//   )[1]
// });

export default class AudienceGeolocationSummary extends React.Component {
  features = [];
  layers = [];
  markers = [];
  interactive = L.featureGroup();
  constructor(props) {
    super(props);
    this.state = {
      zoom: 0
    };
    this._pointToLayer = this._pointToLayer.bind(this);
    this._onEachFeature = this._onEachFeature.bind(this);
    this._handleZoom = this._handleZoom.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { facebookAccountId } = this.props;
    if (nextProps.facebookAccountId !== facebookAccountId) {
      this._resetMap();
    }
  }
  _resetMap() {
    const map = this.refs.map.leafletElement;
    this.features.forEach(feature => {
      map.removeLayer(feature);
    });
    this.features = [];
    this.layers = [];
    this.markers = [];
    this.interactive = L.featureGroup();
  }
  _handleZoom() {
    const map = this.refs.map.leafletElement;

    this.setState({
      zoom: map.getZoom()
    });
  }
  _getPercentage(estimate, total) {
    const { summary } = this.props;
    total = total || summary.facebookAccount.fanCount;
    let dif = Math.min(estimate / total, 0.99);
    return (dif * 100).toFixed(2) + "%";
  }
  _geojson() {
    const { summary } = this.props;
    let geojson = {
      type: "FeatureCollection",
      features: []
    };
    if (summary.mainGeolocation && summary.mainGeolocation.geojson) {
      geojson.features.push({
        ...summary.mainGeolocation.geojson,
        properties: {
          main: true
        }
      });
    }
    summary.data.forEach(item => {
      if (item.geolocation.geojson) {
        geojson.features.push({
          ...item.geolocation.geojson,
          properties: item.audience
        });
      } else if (item.geolocation.center) {
        geojson.features.push({
          type: "Feature",
          properties: {
            ...item.audience,
            radius: item.geolocation.center.radius
          },
          geometry: {
            type: "Point",
            coordinates: [
              item.geolocation.center.center[1],
              item.geolocation.center.center[0]
            ]
          }
        });
      }
    });
    return geojson;
  }
  _style(feature) {
    let style = {
      color: "#000",
      weight: 1
    };
    if (feature.properties && feature.properties.main) {
      style = {
        ...style,
        fill: false
      };
    } else {
      style = {
        ...style,
        fillOpacity: 0.1,
        stroke: false
      };
    }
    return style;
  }
  _pointToLayer(feature, latlng) {
    const circle = L.circle(latlng, {
      radius: feature.properties.radius * 1000,
      stroke: false,
      color: "#000"
    });
    return circle;
  }
  _onEachFeature(feature, layer) {
    this.layers.push(layer);
    const map = this.refs.map.leafletElement;
    const self = this;
    const group = L.featureGroup();
    const interactive = !!feature.properties.estimate;
    let center, marker;
    if (layer._latlng) {
      center = layer._latlng;
    } else {
      layer._map = map;
      center = layer.getBounds().getCenter();
      delete layer._map;
    }
    if (interactive) {
      marker = L.marker(center);
      marker.icon = L.divIcon({
        html: `<span>${self._getPercentage(
          feature.properties.estimate,
          feature.properties.fanCount
        )}</span>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
        popupAnchor: [0, -20],
        className: "geolocation-icon"
      });
      marker.activeIcon = L.divIcon({
        html: `<span>${self._getPercentage(
          feature.properties.estimate,
          feature.properties.fanCount
        )}</span>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
        popupAnchor: [0, -20],
        className: "geolocation-icon active"
      });
      marker.setIcon(marker.icon);
      this.markers.push(marker);
      marker.on("mouseover", ev => {
        this.layers.forEach(layer => {
          layer.setStyle({
            fillOpacity: 0.1
          });
        });
        this.markers.forEach(marker => {
          marker.setIcon(marker.icon).setZIndexOffset(0);
        });
        layer.setStyle({
          fillOpacity: 0.8
        });
        marker.setIcon(marker.activeIcon).setZIndexOffset(10);
      });
      marker.on("mouseout", ev => {
        layer.setStyle({
          fillOpacity: 0.2,
          stroke: false
        });
        marker.setIcon(marker.icon).setZIndexOffset(0);
      });
      this.interactive.addLayer(group);
    }
    if (!this.interactive._map) {
      map.addLayer(this.interactive);
    }
    group.addLayer(layer);
    if (interactive) group.addLayer(marker);
    this.features.push(group);
    map.addLayer(group);
    const bounds = this.interactive.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(this.interactive.getBounds());
    }
  }
  render() {
    const { zoom } = this.state;
    const { loading, summary, campaignId, facebookAccountId } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <Wrapper className={`zoom-${zoom}`}>
          <Grid verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={6}>
                <Header size="large">
                  {summary.facebookAccount.fanCount} fans
                </Header>
                <Table selectable>
                  <Table.Header>
                    <Table.Row>
                      <Table.HeaderCell>Location</Table.HeaderCell>
                      <Table.HeaderCell collapsing>
                        Estimate reach
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell colSpan="2">
                        <a
                          href={FlowRouter.path(
                            "App.campaignAudience.geolocation",
                            {
                              campaignId,
                              facebookId: facebookAccountId,
                              geolocationId: summary.mainGeolocation._id
                            }
                          )}
                        >
                          {summary.mainGeolocation.name}
                        </a>
                      </Table.Cell>
                    </Table.Row>
                    {summary.data.map(item => (
                      <Table.Row key={item.geolocation._id}>
                        <Table.Cell>
                          <a
                            href={FlowRouter.path(
                              "App.campaignAudience.geolocation",
                              {
                                campaignId,
                                facebookId: facebookAccountId,
                                geolocationId: item.geolocation._id
                              }
                            )}
                          >
                            {item.geolocation.name}
                          </a>
                        </Table.Cell>
                        <Table.Cell collapsing>
                          <strong>
                            {this._getPercentage(
                              item.audience.estimate,
                              item.audience.fanCount
                            )}
                          </strong>{" "}
                          <Label size="tiny">{item.audience.estimate}</Label>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table>
              </Grid.Column>
              <Grid.Column width={10}>
                <Map
                  ref="map"
                  onZoomStart={this._handleZoom}
                  onZoomEnd={this._handleZoom}
                  center={[0, 0]}
                  zoom={2}
                  scrollWheelZoom={false}
                  style={{
                    width: "100%",
                    height: "400px"
                  }}
                >
                  <TileLayer
                    opacity={0.5}
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                  />
                  <GeoJSON
                    data={this._geojson()}
                    style={this._style}
                    pointToLayer={this._pointToLayer}
                    onEachFeature={this._onEachFeature}
                  />
                </Map>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Wrapper>
      );
      return <p>Teste</p>;
    }
  }
}
