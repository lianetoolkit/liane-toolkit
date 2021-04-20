import SimpleSchema from "simpl-schema";
import { Promise } from "meteor/promise";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { GeolocationsHelpers } from "./geolocationsHelpers.js";

const schemaConfig = {
  name: {
    type: String,
  },
  parentId: {
    type: String,
    optional: true,
  },
  type: {
    type: String,
    allowedValues: ["location", "center"],
  },
  facebook: {
    type: Array,
    optional: true,
  },
  "facebook.$": {
    type: Object,
    blackbox: true,
  },
  osm: {
    type: Object,
    blackbox: true,
    optional: true,
  },
  center: {
    type: Object,
    blackbox: true,
    optional: true,
  },
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
      center,
    });

    return Geolocations.insert(insertDoc);
  },
});

export const removeGeolocation = new ValidatedMethod({
  name: "geolocations.remove",
  validate: new SimpleSchema({
    geolocationId: {
      type: String,
    },
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
  },
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
      center,
    });

    Geolocations.upsert({ _id }, { $set: insertDoc });
    return;
  },
});

export const geolocationsSearch = new ValidatedMethod({
  name: "geolocations.search",
  validate: new SimpleSchema({
    search: {
      type: String,
      optional: true,
    },
  }).validator(),
  run({ search }) {
    this.unblock();
    logger.debug("geolocations.search called", { search });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    let selector = {};
    let options = {
      limit: 30,
      sort: { createdAt: -1 },
      fields: {
        name: 1,
        regionType: 1,
      },
    };

    if (search) {
      selector.name = {
        $regex: new RegExp(`^${search}$`, "i"),
      };
    }

    return Geolocations.find(selector, options).fetch();
  },
});

export const geolocationsSelectGet = new ValidatedMethod({
  name: "geolocations.selectGet",
  validate: new SimpleSchema({
    geolocationId: {
      type: String,
    },
  }).validator(),
  run({ geolocationId }) {
    this.unblock();
    logger.debug("geolocations.selectGet called", { geolocationId });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error(401, "You need to login");
    }

    let selector = { _id: geolocationId };
    let options = {
      fields: {
        name: 1,
        regionType: 1,
      },
    };

    const geolocation = Geolocations.findOne(selector, options);

    return geolocation;
  },
});

export const searchAdGeolocations = new ValidatedMethod({
  name: "geolocations.searchAdGeolocations",
  validate: new SimpleSchema({
    q: {
      type: String,
    },
    location_types: {
      type: Array,
      optional: true,
    },
    "location_types.$": {
      type: String,
    },
    country_code: {
      type: String,
      optional: true,
    },
    region_id: {
      type: String,
      optional: true,
    },
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
      access_token: user.services.facebook.accessToken,
    });
  },
});

export const searchNominatim = new ValidatedMethod({
  name: "geolocations.searchNominatim",
  validate: new SimpleSchema({
    q: {
      type: String,
      optional: true,
    },
    city: {
      type: String,
      optional: true,
    },
    state: {
      type: String,
      optional: true,
    },
    country: {
      type: String,
      optional: true,
    },
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
  },
});

export const geolocationsQueryCount = new ValidatedMethod({
  name: "geolocations.queryCount",
  validate: new SimpleSchema({
    query: {
      type: Object,
      blackbox: true,
      optional: true,
    },
  }).validator(),
  run({ query }) {
    const userId = Meteor.userId();
    if (!userId || !Roles.userIsInRole(userId, ["admin"])) {
      throw new Meteor.Error(401, "You are not allowed to perform this action");
    }
    return Geolocations.find(query || {}).count();
  },
});
