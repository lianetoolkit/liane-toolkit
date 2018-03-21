import React from "react";
import styled from "styled-components";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import crypto from "crypto";
import {
  Grid,
  Table,
  Divider,
  Statistic,
  Header,
  Label,
  Dimmer,
  Loader
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
    this._style = this._style.bind(this);
    this._pointToLayer = this._pointToLayer.bind(this);
    this._onEachFeature = this._onEachFeature.bind(this);
    this._handleZoom = this._handleZoom.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { facebookAccountId, geolocationId } = this.props;
    if (
      nextProps.facebookAccountId !== facebookAccountId ||
      nextProps.geolocationId !== geolocationId
    ) {
      this._resetMap();
    }
  }
  _resetMap() {
    const map = this.refs.map.leafletElement;
    this.features.forEach(feature => {
      feature.eachLayer(layer => {
        feature.removeLayer(layer);
      });
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
  _getPercentage(estimate) {
    const { summary } = this.props;
    let total = summary.facebookAccount.fanCount;
    if (summary.mainGeolocation) {
      total = AudienceUtils.getValue(summary.mainGeolocation.audience.estimate);
    }
    let cent = Math.min(AudienceUtils.getValue(estimate) / total, 0.99);
    return (cent * 100).toFixed(2) + "%";
  }
  _geojson() {
    const { summary, geolocationId } = this.props;
    let geojson = {
      type: "FeatureCollection",
      features: []
    };
    if (summary.mainGeolocation && summary.mainGeolocation.geojson) {
      let active = false;
      if (summary.mainGeolocation._id == geolocationId) {
        active = true;
      }
      geojson.features.push({
        ...summary.mainGeolocation.geojson,
        properties: {
          _id: summary.mainGeolocation._id,
          main: true,
          active
        }
      });
    }
    summary.data.forEach(item => {
      let active = false;
      if (item.geolocation._id == geolocationId) {
        active = true;
      }
      if (item.geolocation.geojson) {
        geojson.features.push({
          ...item.geolocation.geojson,
          properties: {
            _id: item.geolocation._id,
            ...item.audience,
            active
          }
        });
      } else if (item.geolocation.center) {
        geojson.features.push({
          type: "Feature",
          properties: {
            _id: item.geolocation._id,
            ...item.audience,
            radius: item.geolocation.center.radius,
            active
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
    const { geolocationId } = this.props;
    let style = {
      color: "#000",
      weight: 1
    };
    if (feature.properties && feature.properties.main) {
      style = {
        ...style,
        fill: false
      };
      if (feature.properties.active) {
        style = {
          ...style,
          color: "#2196f3",
          weight: 2
        };
      }
    } else {
      style = {
        ...style,
        fillOpacity: 0.1,
        stroke: false
      };
      if (feature.properties.active) {
        style = {
          ...style,
          fillOpacity: 0.8,
          color: "#2196f3"
        };
      }
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
  _fitBounds = _.debounce(() => {
    const map = this.refs.map.leafletElement;
    const bounds = this.interactive.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(this.interactive.getBounds());
    }
  }, 100);
  _onEachFeature(feature, layer) {
    const { campaignId, facebookAccountId } = this.props;
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
          feature.properties.estimate
        )}</span>`,
        iconSize: [100, 30],
        iconAnchor: [50, 15],
        popupAnchor: [0, -20],
        className: "geolocation-icon"
      });
      marker.activeIcon = L.divIcon({
        html: `<span>${self._getPercentage(
          feature.properties.estimate
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
          if (!layer.feature.properties.active) {
            layer.setStyle({
              fillOpacity: 0.1
            });
          }
        });
        if (!layer.feature.properties.active) {
          this.markers.forEach(marker => {
            marker.setIcon(marker.icon).setZIndexOffset(0);
          });
          layer.setStyle({
            fillOpacity: 0.8
          });
          marker.setIcon(marker.activeIcon).setZIndexOffset(10);
        }
      });
      marker.on("mouseout", ev => {
        if (!layer.feature.properties.active) {
          layer.setStyle({
            fillOpacity: 0.2,
            stroke: false
          });
          marker.setIcon(marker.icon).setZIndexOffset(0);
        }
      });
      marker.on("click", ev => {
        FlowRouter.go("App.campaignAudience.geolocation", {
          campaignId: campaignId,
          facebookId: facebookAccountId,
          geolocationId: layer.feature.properties._id
        });
      });
      this.interactive.addLayer(group);
      this._fitBounds();
    }
    if (!this.interactive._map) {
      map.addLayer(this.interactive);
    }
    group.addLayer(layer);
    if (interactive) group.addLayer(marker);
    this.features.push(group);
    map.addLayer(group);
  }
  render() {
    const { zoom } = this.state;
    const {
      loading,
      summary,
      campaignId,
      facebookAccountId,
      geolocationId
    } = this.props;
    if (loading && !summary) {
      return <Loading />;
    } else if (summary) {
      const geojson = this._geojson();
      const geoHash = crypto
        .createHash("sha1")
        .update(JSON.stringify(geojson))
        .digest("hex");
      return (
        <Dimmer.Dimmable
          blurring
          dimmed={loading}
          as={Wrapper}
          className={`zoom-${zoom}`}
        >
          <Header size="large">{summary.facebookAccount.fanCount} fans</Header>
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
              key={geoHash}
              data={geojson}
              style={this._style}
              pointToLayer={this._pointToLayer}
              onEachFeature={this._onEachFeature}
            />
          </Map>
        </Dimmer.Dimmable>
      );
    }
  }
}
