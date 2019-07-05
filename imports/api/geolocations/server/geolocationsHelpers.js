import simplifyGeojson, { simplify } from "simplify-geojson";
import axios from "axios";

const GeolocationsHelpers = {
  facebookSearch(query) {
    let res;
    try {
      res = Promise.await(FB.api("search", query));
    } catch (e) {
      throw new Meteor.Error(e);
    }
    console.log(res);
    return res.data;
  },
  getFacebookCountryByCode({ countryCode, accessToken }) {
    return this.facebookSearch({
      location_types: ["country"],
      q: countryCode,
      match_country_code: true
    })[0];
  },
  findFacebookFromNominatim({ data, regionType, accessToken }) {
    let res;
    let query = {
      type: "adgeolocation",
      access_token: accessToken
    };
    switch (regionType) {
      case "country":
        res = this.facebookSearch({
          ...query,
          location_types: ["country"],
          q: data.address.country_code,
          match_country_code: true
        });
        break;
      case "state":
        res = this.facebookSearch({
          ...query,
          location_types: ["region"],
          country_code: data.address.country_code,
          q: data.namedetails.name
        })[0];
        break;
      case "city":
        let cityQuery = {
          ...query,
          location_types: ["city"],
          country_code: data.address.country_code,
          q: data.namedetails.name
        };
        const region = this.facebookSearch({
          ...query,
          location_types: ["region"],
          country_code: data.address.country_code,
          q: data.address.state
        });
        if (region && region.length) {
          cityQuery["region_id"] = region[0].key;
        }
        res = this.facebookSearch(cityQuery);
        res = res.filter(item => item.type == "city")[0];
        break;
    }
    return res;
  },
  nominatimSearch(query) {
    const api = "http://nominatim.openstreetmap.org/search";
    const res = Promise.await(
      axios.get(api, {
        params: {
          format: "json",
          addressdetails: 1,
          namedetails: 1,
          ...query
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
  getOSM({ osm_id, osm_type, withPolygon }) {
    const api = "http://nominatim.openstreetmap.org/reverse";
    let params = {
      osm_type: this._parseOSMType(osm_type),
      osm_id: osm_id,
      format: "json",
      addressdetails: 1,
      extratags: 1,
      namedetails: 1
    };
    if (withPolygon) {
      params["polygon_geojson"] = 1;
    }
    try {
      let res = Promise.await(axios.get(api, { params }));
      if (res.data.geojson && res.data.geojson.coordinates) {
        res.data.geojson = simplifyGeojson(
          { type: "Feature", geometry: res.data.geojson },
          // res.data.geojson.coordinates,
          0.01
        );
      }
      return res.data;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(500, error.data);
    }
  },
  discoverAndStore({ osm_id, osm_type, accessToken }) {},
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
