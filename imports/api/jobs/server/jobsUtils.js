const { Jobs } = require("../jobs.js");
import flatten from "flat";

export const JobsUtils = {
  isJobDuplicated({ jobType, jobData }) {
    check(jobType, String);
    check(jobData, Object);

    const duplicateJobQuery = {
      type: jobType,
      data: jobData
    };
    const flattenedDuplicateJobQuery = flatten(duplicateJobQuery);
    flattenedDuplicateJobQuery.status = {
      $nin: ["cancelled", "failed", "completed"]
    };

    // logger.debug {flattenedDuplicateJobQuery}
    const jobsInCollection = Jobs.find(flattenedDuplicateJobQuery).fetch();

    if (jobsInCollection.length > 0) {
      return true;
    } else {
      return false;
    }
  }
};
