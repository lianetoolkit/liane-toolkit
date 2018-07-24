import React from "react";
import { GeoJSON } from "react-leaflet";

export default class AudienceLayer extends React.Component {
  constructor(props) {
    super(props);
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
  _pointToLayer(feature, latlng) {
    const circle = L.circle(latlng, {
      radius: feature.properties.radius * 1000,
      stroke: false,
      color: "#000"
    });
    return circle;
  }
  render() {
    const { audience } = this.props;
    if (audience) {
      const geojson = this._geojson();
      return <GeoJSON data={geojson} pointToLayer={this._pointToLayer} />;
    } else {
      return null;
    }
  }
}
