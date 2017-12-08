import { Facebook, FacebookApiException } from "fb";

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
  }
};

exports.GeolocationsHelpers = GeolocationsHelpers;
