import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { GeolocationsHelpers } from "./geolocationsHelpers.js";

const schemaConfig = {
  name: {
    type: String
  },
  parentId: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    allowedValues: ["location", "center"]
  },
  facebook: {
    type: Array,
    optional: true
  },
  "facebook.$": {
    type: Object,
    blackbox: true
  },
  osm: {
    type: Object,
    blackbox: true,
    optional: true
  },
  center: {
    type: Object,
    blackbox: true,
    optional: true
  }
};

const validateCreate = new SimpleSchema(schemaConfig).validator();
const validateUpdate = new SimpleSchema(
  Object.assign({ _id: { type: String } }, schemaConfig)
).validator();

export const createGeolocation = new ValidatedMethod({
  name: "geolocations.create",
  validate: validateCreate,
  run({ name, parentId, facebook, osm, type, center }) {
    logger.debug("geolocations.create called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    if (osm && osm.osm_id) {
      osm = GeolocationsHelpers.getOSM(osm);
    } else {
      osm = undefined;
    }

    const insertDoc = GeolocationsHelpers.parse({
      name,
      parentId,
      facebook,
      osm,
      type,
      center
    });

    return Geolocations.insert(insertDoc);
  }
});

export const removeGeolocation = new ValidatedMethod({
  name: "geolocations.remove",
  validate: new SimpleSchema({
    geolocationId: {
      type: String
    }
  }).validator(),
  run({ geolocationId }) {
    logger.debug("geolocations.remove called", { geolocationId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    return Geolocations.remove(geolocationId);
  }
});

export const updateGeolocation = new ValidatedMethod({
  name: "geolocations.update",
  validate: validateUpdate,
  run({ _id, name, parentId, facebook, osm, type, center }) {
    logger.debug("geolocations.update called", { name });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    if (osm && osm.osm_id) {
      osm = GeolocationsHelpers.getOSM(osm);
    } else {
      osm = undefined;
    }

    const insertDoc = GeolocationsHelpers.parse({
      _id,
      name,
      parentId,
      facebook,
      osm,
      type,
      center
    });

    Geolocations.upsert({ _id }, { $set: insertDoc });
    return;
  }
});

export const searchAdGeolocations = new ValidatedMethod({
  name: "geolocations.searchAdGeolocations",
  validate: new SimpleSchema({
    q: {
      type: String
    },
    location_types: {
      type: Array,
      optional: true
    },
    "location_types.$": {
      type: String
    },
    country_code: {
      type: String,
      optional: true
    },
    region_id: {
      type: String,
      optional: true
    }
  }).validator(),
  run(query) {
    this.unblock();
    logger.debug("geolocations.searchAdGeolocations called", { query });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    if (!Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(403, "Access denied");
    }

    const user = Meteor.users.findOne(userId);

    return GeolocationsHelpers.facebookSearch({
      ...query,
      type: "adgeolocation",
      access_token: user.services.facebook.accessToken
    });
  }
});

export const searchNominatim = new ValidatedMethod({
  name: "geolocations.searchNominatim",
  validate: new SimpleSchema({
    q: {
      type: String,
      optional: true
    },
    city: {
      type: String,
      optional: true
    },
    state: {
      type: String,
      optional: true
    },
    country: {
      type: String,
      optional: true
    }
  }).validator(),
  run(query) {
    this.unblock();
    logger.debug("geolocations.searchNominatim called", query);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    // if (!Roles.userIsInRole(userId, ["admin"])) {
    //   throw new Meteor.Error(403, "Access denied");
    // }

    return GeolocationsHelpers.nominatimSearch(query);
  }
});

export const matchFromOSM = new ValidatedMethod({
  name: "geolocations.matchFromOSM",
  validate: new SimpleSchema({
    id: {
      type: Number
    },
    type: {
      type: String
    },
    regionType: {
      type: String
    }
  }).validator(),
  run({ id, type, regionType }) {
    this.unblock();
    logger.debug("geolocations.matchFromOSM called", { id, type, regionType });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    const localData = Geolocations.findOne({ "osm.osm_id": id });

    if (!localData) {
      const user = Meteor.users.findOne(userId);
      const osm = GeolocationsHelpers.getOSM({ osm_id: id, osm_type: type });
      const facebookData = GeolocationsHelpers.findFacebookFromNominatim({
        data: osm,
        regionType,
        accessToken: user.services.facebook.accessToken
      });
      // return facebookData;
    }

    return true;

    // return localData;
  }
});
