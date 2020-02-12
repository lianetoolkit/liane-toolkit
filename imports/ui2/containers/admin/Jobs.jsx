import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Jobs } from "/imports/api/jobs/jobs";
import JobsPage from "/imports/ui2/pages/admin/Jobs.jsx";
import { pluck } from "underscore";

const JobsSubs = new SubsManager();

export default withTracker(props => {
  const queryParams = props.query;
  const limit = 10;
  const page = parseInt(queryParams.page || 1);
  const skip = (page - 1) * limit;

  const query = {};

  const options = {
    sort: { created: -1 },
    limit,
    skip,
    transform: job => {
      return job;
    }
  };

  const jobsHandle = JobsSubs.subscribe("admin.jobs", {
    query,
    options
  });

  const loading = !jobsHandle.ready();
  const jobs = jobsHandle.ready()
    ? Jobs.find(query, options).fetch()
    : [];

  return {
    loading,
    page,
    limit,
    jobs
  };
})(JobsPage);
