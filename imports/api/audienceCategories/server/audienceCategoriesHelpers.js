import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";
import { Facebook, FacebookApiException } from "fb";

const options = {
  version: "v2.11",
  client_id: Meteor.settings.facebook.clientId,
  client_secret: Meteor.settings.facebook.clientSecret
};

const _fb = new Facebook(options);

const AudienceCategoriesHelpers = {
  fetchAudienceCategoriesByAccount({ facebookAccountId }) {
    check(facebookAccountId, String);

    logger.debug("AudienceCategoriesHelpers.fetchAudienceCategoriesByAccount", {
      facebookAccountId
    });

    categories = AudienceCategories.find().fetch();
    for (const cat of categories) {
      JobsHelpers.addJob({
        jobType: "audiences.fetchByAudienceCategory",
        jobData: {
          facebookAccountId: facebookAccountId,
          audienceCategoryId: cat._id
        }
      });
    }
  },
  facebookSearch({ accessToken, type, q }) {
    _fb.setAccessToken(accessToken);

    return _fb.api("search", {
      type,
      q
    });
  },
  getInterestSuggestions({ accessToken, interest_list }) {
    _fb.setAccessToken(accessToken);

    return _fb.api("search", {
      type: "adinterestsuggestion",
      interest_list
    });
  }
};

exports.AudienceCategoriesHelpers = AudienceCategoriesHelpers;
