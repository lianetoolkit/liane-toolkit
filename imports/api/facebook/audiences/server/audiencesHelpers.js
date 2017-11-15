import { Promise } from "meteor/promise";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Geolocations } from "/imports/api/geolocations/geolocations.js";
import { Contexts } from "/imports/api/contexts/contexts.js";
import { FacebookAudiences } from "/imports/api/facebook/audiences/audiences.js";
import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { Facebook, FacebookApiException } from "fb";
import _ from "underscore";
import moment from "moment";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret,
  admin: Meteor.settings.facebook.admin,
  adAccount: Meteor.settings.facebook.adAccount
};

_fb = new Facebook(options);

const route = `act_${options.adAccount}/reachestimate`;

const FacebookAudiencesHelpers = {
  fetchAudienceCategory({ facebookAccountId, audienceCategoryId }) {
    check(facebookAccountId, String);
    check(audienceCategoryId, String);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceCategory", {
      facebookAccountId,
      audienceCategoryId
    });

    const audienceCategory = AudienceCategories.findOne(audienceCategoryId);

    const spec = audienceCategory.spec;

    for (const contextId of audienceCategory.contextIds) {
      FacebookAudiencesHelpers.fetchContextAudiences({
        contextId,
        facebookAccountId,
        audienceCategoryId,
        spec
      });
    }
  },
  fetchContextAudiences({
    facebookAccountId,
    contextId,
    audienceCategoryId,
    spec
  }) {
    check(facebookAccountId, String);
    check(audienceCategoryId, String);
    check(contextId, String);
    check(spec, Object);

    logger.debug("FacebookAudiencesHelpers.fetchContextAudiences", {
      facebookAccountId,
      contextId,
      spec
    });

    const context = Contexts.findOne(contextId);
    if (!context) {
      return { error: "Context does not exists" };
    }
    for (const location of context.geolocations) {
      const geoLoc = Geolocations.findOne(location);
      spec["geo_locations"] = {};
      spec.geo_locations[geoLoc.facebookType] = [
        { name: geoLoc.name, key: geoLoc.facebookKey }
      ];

      response = FacebookAudiencesHelpers.fetchAudienceByLocation({
        facebookAccountId,
        spec
      });

      if (response) {
        const data = response.result;
        data.audienceCategoryId = audienceCategoryId;
        FacebookAudiences.upsert(
          {
            facebookAccountId: facebookAccountId,
            fetch_date: moment().format("YYYY-MM-DD"),
            geoLocationId: geoLoc._id
          },
          { $set: data }
        );
        logger.debug("fetchContextAudiences result", { response });
      }
    }
  },
  fetchAudienceByLocation({ facebookAccountId, spec }) {
    check(facebookAccountId, String);
    check(spec, Object);

    logger.debug("FacebookAudiencesHelpers.fetchAudienceByLocation", {
      facebookAccountId,
      spec
    });

    const admin = Meteor.users.findOne({
      "services.facebook.id": options.admin
    });

    if (!admin) {
      return { error: "Admin does not exist." };
    }

    const accessToken = admin.services.facebook.accessToken;

    spec["connections"] = [facebookAccountId];

    const fetch = function(spec) {
      return Promise.await(
        _fb.api(route, {
          targeting_spec: spec,
          access_token: accessToken
        })
      ).data.users;
    };

    let result = {};

    result["estimate"] = fetch(spec);
    result["total"] = fetch(_.omit(spec, "interests"));
    result["location_estimate"] = fetch(_.omit(spec, "connections"));
    result["location_total"] = fetch(_.omit(spec, "interests", "connections"));

    logger.debug("fetchAudienceByLocation result", { result });

    return { result };
  }
};

exports.FacebookAudiencesHelpers = FacebookAudiencesHelpers;
