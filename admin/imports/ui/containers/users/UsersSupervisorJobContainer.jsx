import { Meteor } from "meteor/meteor";
import { createContainer } from "meteor/react-meteor-data";
import { Jobs } from "/imports/api/jobs/jobs.js";
import UserSupervisorJob from "/imports/ui/components/users/detail/UserSupervisorJob.jsx";

export default createContainer(({ userId }) => {
  console.log("UsersSupervisorJobContainer", userId);
  const jobsHandle = Meteor.subscribe("admin.jobs.supervisor", {
    userId: userId
  });
  const loading = !jobsHandle.ready();

  const job = Jobs.findOne({
    "data.userId": userId,
    type: "users.supervisor"
  });
  console.log(job);
  return {
    loading,
    userId,
    job
  };
}, UserSupervisorJob);
