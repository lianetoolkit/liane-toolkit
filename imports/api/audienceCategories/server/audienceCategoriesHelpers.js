import { AudienceCategories } from "/imports/api/audienceCategories/audienceCategories.js";
import { JobsHelpers } from "/imports/api/jobs/server/jobsHelpers.js";

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
  }
};

exports.AudienceCategoriesHelpers = AudienceCategoriesHelpers;
