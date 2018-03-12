import { Facebook, FacebookApiException } from "fb";
import simplifyGeojson, { simplify } from "simplify-geojson";
import axios from "axios";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

const GeolocationsHelpers = {
  facebookSearch(query) {
    return _fb.api("search", query);
  },
  nominatimSearch({ q }) {
    const api = "http://nominatim.openstreetmap.org/search";
    const res = Promise.await(
      axios.get(api, {
        params: {
          format: "json",
          addressdetails: 1,
          q
        }
      })
    );
    return res.data;
  },
  _parseOSMType(type) {
    switch (type) {
      case "relation":
        return "R";
      case "node":
        return "N";
      case "way":
        return "W";
    }
  },
  getOSM({ osm_id, osm_type }) {
    const api = "http://nominatim.openstreetmap.org/reverse";
    try {
      let res = Promise.await(
        axios.get(api, {
          params: {
            osm_type: this._parseOSMType(osm_type),
            osm_id: osm_id,
            format: "json",
            addressdetails: 1,
            polygon_geojson: 1,
            extratags: 1,
            namedetails: 1
          }
        })
      );
      console.log("BEFORE", JSON.stringify(res.data.geojson).length);
      if (res.data.geojson && res.data.geojson.coordinates) {
        res.data.geojson = simplifyGeojson(
          { type: "Feature", geometry: res.data.geojson },
          // res.data.geojson.coordinates,
          0.01
        );
      }
      console.log("AFTER", JSON.stringify(res.data.geojson).length);
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(500, error.data);
    }
  },
  parse(geolocation) {
    if (geolocation.osm && geolocation.osm.lat) {
      geolocation.center = [geolocation.osm.lat, geolocation.osm.lon];
    }
    if (geolocation.osm && geolocation.osm.geojson) {
      geolocation.geojson = geolocation.osm.geojson;
      delete geolocation.osm.geojson;
    }
    return geolocation;
  }
};

exports.GeolocationsHelpers = GeolocationsHelpers;
