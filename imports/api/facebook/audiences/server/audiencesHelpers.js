import { Promise } from "meteor/promise";
import { FacebookAccounts } from "/imports/api/facebook/accounts/accounts.js";
import { Facebook, FacebookApiException } from "fb";
import _ from "underscore";

const options = {
  version: 'v2.11',
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret,
  admin: Meteor.settings.facebook.admin,
  adAccount: Meteor.settings.facebook.adAccount
};

_fb = new Facebook(options);

const route = `act_${options.adAccount}/reachestimate`;

const FacebookAudiencesHelpers = {
  fetchAudience({ facebookAccountId, spec }) {

    check(facebookAccountId, String);
    check(spec, Object);

    const admin = Meteor.users.findOne({
      'services.facebook.id': options.admin
    });

    if (!admin) {
      return { error: "Admin does not exist." };
    }
    const accessToken = admin.services.facebook.accessToken;

    const account = FacebookAccounts.findOne(facebookAccountId);

    if(!account) {
      return { error: "Account not found." };
    }

    spec["connections"] = [account.facebookId];

    // Should be populated with campaign context locations
    spec["geo_locations"] = {
      countries: ["BR"]
    };

    const fetch = function (spec) {
      return Promise.await(
        _fb.api(route, {
          targeting_spec: spec,
          access_token: accessToken
        })
      ).data.users;
    };

    let result = {};

    result['estimate'] = fetch(spec);
    result['total'] = fetch(_.omit(spec, 'interests'));
    result['location_estimate'] = fetch(_.omit(spec, 'connections'));
    result['location_total'] = fetch(_.omit(spec, 'interests', 'connections'));

    return { result };
  }
};

exports.FacebookAudiencesHelpers = FacebookAudiencesHelpers;
