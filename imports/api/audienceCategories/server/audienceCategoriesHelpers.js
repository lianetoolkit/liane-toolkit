
const AudienceCategoriesHelpers = {
  facebookSearch({ accessToken, type, q }) {
    FB.setAccessToken(accessToken);

    return FB.api("search", {
      type,
      q
    });
  },
  getInterestSuggestions({ accessToken, interest_list }) {
    FB.setAccessToken(accessToken);

    return FB.api("search", {
      type: "adinterestsuggestion",
      interest_list
    });
  }
};

exports.AudienceCategoriesHelpers = AudienceCategoriesHelpers;
