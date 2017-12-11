const { Jobs } = require("../jobs.js");
import flatten from "flat";

export const JobsUtils = {
  getJobInCollectionId({ jobType, jobData }) {
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

    const jobsInCollection = Jobs.find(flattenedDuplicateJobQuery).fetch();

    if (jobsInCollection.length > 0) {
      return jobsInCollection[0]._id;
    } else {
      return false;
    }
  }
};
