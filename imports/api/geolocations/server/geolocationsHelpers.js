import simplifyGeojson, { simplify } from "simplify-geojson";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import axios from "axios";

const GeolocationsHelpers = {
  facebookSearch(query) {
    let res;
    try {
      res = Promise.await(FB.api("search", query));
    } catch (e) {
      throw new Meteor.Error(e);
    }
    return res.data;
  },
  getFacebookCountryByCode({ countryCode, accessToken }) {
    return this.facebookSearch({
      location_types: ["country"],
      q: countryCode,
      match_country_code: true,
    })[0];
  },
  findFacebookFromNominatim({ data, regionType, defaultQuery, accessToken }) {
    let res;
    defaultQuery = defaultQuery || {};
    let query = {
      type: "adgeolocation",
      access_token: accessToken,
      ...defaultQuery,
    };
    switch (regionType) {
      case "country":
        res = this.facebookSearch({
          ...query,
          location_types: ["country"],
          q: data.address.country_code,
          match_country_code: true,
        })[0];
        break;
      case "state":
        res = this.facebookSearch({
          ...query,
          location_types: ["region"],
          country_code: data.address.country_code,
          q: data.namedetails.name,
        })[0];
        break;
      case "city":
        let cityQuery = {
          ...query,
          location_types: ["city"],
          country_code: data.address.country_code,
          q: data.namedetails.name,
        };
        if (!defaultQuery.region_id) {
          const region = this.facebookSearch({
            ...query,
            location_types: ["region"],
            country_code: data.address.country_code,
            q: data.address.state,
          });
          if (region && region.length) {
            cityQuery["region_id"] = region[0].key;
          }
        }
        res = this.facebookSearch(cityQuery);
        res = res.filter(
          (item) => item.type == "city" || item.type == "subcity"
        )[0];
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
          ...query,
        },
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
      namedetails: 1,
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
  discoverAndStore({ osm_id, osm_type, type, accessToken }) {
    const localData = Geolocations.findOne({ "osm.osm_id": osm_id });

    // Return if data already exists
    if (localData) return localData._id;

    const osm = this.getOSM({ osm_id, osm_type, withPolygon: true });
    let defaultQuery = {};
    if (type == "city") {
      const osmStateRes = this.nominatimSearch({
        state: osm.address.state,
        country: osm.address.country,
      });
      if (osmStateRes && osmStateRes.length) {
        const osmState = osmStateRes[0];
        const fbState = this.findFacebookFromNominatim({
          accessToken,
          data: osmState,
          regionType: "state",
        });
        if (fbState) {
          defaultQuery = { region_id: fbState.key };
        }
      }
    }
    const fbData = this.findFacebookFromNominatim({
      accessToken,
      defaultQuery,
      data: osm,
      regionType: type,
    });

    let doc = {
      name: osm.namedetails.name,
      type: "location",
      regionType: type,
      osm,
    };
    if (fbData) {
      doc.facebook = [fbData];
    }

    const parsed = this.parse(doc);
    const res = Geolocations.upsert(
      { "osm.osm_id": osm.osm_id },
      { $set: parsed }
    );
    return res.insertedId;
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
  },
};

exports.GeolocationsHelpers = GeolocationsHelpers;
