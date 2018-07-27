import React from "react";
import { GeoJSON } from "react-leaflet";
import AudienceUtils from "/imports/ui/components/audiences/Utils.js";
import leafletPip from "@mapbox/leaflet-pip";

export default class AudienceLayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: []
    };
    this._getAudience = this._getAudience.bind(this);
    this._onEachFeature = this._onEachFeature.bind(this);
    this._buildGrid = this._buildGrid.bind(this);
  }
  componentDidUpdate(prevProps, prevState) {
    const { onGrid } = this.props;
    const { grid } = this.state;
    if (JSON.stringify(prevState.grid) != JSON.stringify(grid)) {
      onGrid(grid);
    }
  }
  _geojson() {
    const { audience } = this.props;
    let geojson = {
      type: "FeatureCollection",
      features: []
    };
    if (audience.mainGeolocation && audience.mainGeolocation.geojson) {
      geojson.features.push({
        ...audience.mainGeolocation.geojson,
        properties: {
          _id: audience.mainGeolocation._id,
          main: true
        }
      });
    }
    audience.geolocations.forEach(geolocation => {
      if (geolocation.geojson) {
        geojson.features.push({
          ...geolocation.geojson,
          properties: {
            _id: geolocation._id
          }
        });
      } else if (geolocation.center) {
        geojson.features.push({
          type: "Feature",
          properties: {
            _id: geolocation._id,
            radius: geolocation.center.radius
          },
          geometry: {
            type: "Point",
            coordinates: [
              geolocation.center.center[1],
              geolocation.center.center[0]
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
      weight: 1,
      fill: "#000",
      fillOpacity: 0
    };
    if (feature.properties && feature.properties.main) {
      style = {
        ...style,
        weight: 1.5,
        color: "#2196f3"
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
  _getAudience(accountAudience, geolocationId) {
    const { audience } = this.props;
    const data = accountAudience.audience.find(
      a => a.geolocationId == geolocationId
    );
    let total = audience.fanCount;
    const mainGeolocationId = audience.mainGeolocation._id;
    const mainGeolocationAudience = accountAudience.audience.find(
      a => a.geolocationId == mainGeolocationId
    );
    if (mainGeolocationAudience) {
      total = AudienceUtils.getValue(mainGeolocationAudience.estimate);
    }
    let cent = Math.min(AudienceUtils.getValue(data.estimate) / total, 0.99);
    return (cent * 100).toFixed(2) + "%";
  }
  _buildGrid(geolocationId) {
    const { audience } = this.props;
    let geolocation;
    if (geolocationId == audience.mainGeolocation._id) {
      geolocation = audience.mainGeolocation;
    } else {
      geolocation = audience.geolocations.find(g => g._id == geolocationId);
    }
    let grid = {
      type: "list",
      name: geolocation.name,
      data: []
    };
    for (const accountAudience of audience.data) {
      grid.data.push({
        name: accountAudience.name,
        Audience: this._getAudience(accountAudience, geolocationId)
      });
    }
    return grid;
  }
  _onEachFeature(feature, layer) {
    const { onGrid } = this.props;
    if (!feature.properties.main) {
      layer._grid = this._buildGrid(feature.properties._id);
    }
  }
  _addGridItem = data => {
    const { grid } = this.state;
    if (!grid || !grid.length) {
      this.setState({
        grid: [data]
      });
    } else {
      const found = grid.find(
        item => JSON.stringify(item) == JSON.stringify(data)
      );
      if (!found) {
        this.setState({
          grid: [...grid, data]
        });
      }
    }
  };
  _removeGridItem = data => {
    const { grid } = this.state;
    if (grid && grid.length) {
      let newGrid = [...grid];
      newGrid = newGrid.filter(
        item => JSON.stringify(item) != JSON.stringify(data)
      );
      this.setState({
        grid: newGrid
      });
    }
  };
  _move = ev => {
    const { grid } = this.state;
    const layers = leafletPip.pointInLayer(ev.latlng, this._layer);
    let toRemove = [...grid];
    layers.forEach(layer => {
      toRemove = toRemove.filter(
        item => JSON.stringify(item) != JSON.stringify(layer._grid)
      );
      if (layer._grid) {
        this._addGridItem(layer._grid);
      }
    });
    if (toRemove && toRemove.length) {
      toRemove.forEach(grid => {
        if (grid) {
          this._removeGridItem(grid);
        }
      });
    }
  };
  _handleAdd = ev => {
    this._layer = ev.target;
    const map = ev.target._map;
    map.on("mousemove", this._move);
  };
  _handleRemove = ev => {
    map.off("mousemove", this._move);
  };
  render() {
    const { audience } = this.props;
    if (audience) {
      const geojson = this._geojson();
      return (
        <GeoJSON
          data={geojson}
          style={this._style}
          pointToLayer={this._pointToLayer}
          onEachFeature={this._onEachFeature}
          onAdd={this._handleAdd}
          onRemove={this._handleRemove}
        />
      );
    } else {
      return null;
    }
  }
}
