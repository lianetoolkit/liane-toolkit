import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Card, Divider, Statistic, Header, Label } from "semantic-ui-react";
import AudienceUtils from "./Utils.js";
import {
  Map,
  Marker,
  Popup,
  TileLayer,
  LayerGroup,
  GeoJSON
} from "react-leaflet";

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
  _getPercentage(estimate) {
    const { summary } = this.props;
    const total = summary.facebookAccount.fanCount;
    let dif = Math.min(estimate / total, 0.99);
    return (dif * 100).toFixed(2) + "%";
  }
  _getGeoJSON() {
    const { summary } = this.props;
    console.log(summary);
    let geojson = {
      type: "FeatureCollection",
      features: []
    };
    if (summary.mainGeolocation && summary.mainGeolocation.geojson) {
      geojson.features.push(summary.mainGeolocation.geojson);
    }
    summary.data.forEach(item => {
      if (item.geolocation.geojson) {
        geojson.features.push(item.geolocation.geojson);
      } else if (item.geolocation.center) {
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: item.geolocation.center.center
          }
        });
      }
    });
    console.log(geojson);
    return geojson;
  }
  render() {
    const { loading, summary } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <div>
          <Map
            center={[0, 0]}
            zoom={2}
            style={{
              width: "100%",
              height: "600px"
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            />
            {summary.mainGeolocation && summary.mainGeolocation.geojson ? (
              <GeoJSON data={this._getGeoJSON()} />
            ) : null}
          </Map>
          <Divider />
          <Card.Group>
            {summary.data.map(item => (
              <Card key={item.geolocation._id}>
                <Card.Content>
                  <Card.Header>{item.geolocation.name}</Card.Header>
                </Card.Content>
                <Card.Content textAlign="center">
                  <Statistic size="small">
                    <Statistic.Value>
                      {this._getPercentage(item.audience.estimate)}
                    </Statistic.Value>
                    <Statistic.Label>of your total audience</Statistic.Label>
                  </Statistic>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </div>
      );
      return <p>Teste</p>;
    }
  }
}
