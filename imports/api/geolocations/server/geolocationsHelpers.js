import { Facebook, FacebookApiException } from "fb";
import axios from "axios";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

const GeolocationsHelpers = {
  facebookSearch({ accessToken, type, q }) {
    _fb.setAccessToken(accessToken);

    return _fb.api("search", {
      type,
      q
    });
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
      const res = Promise.await(
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
      return res.data;
    } catch (error) {
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
