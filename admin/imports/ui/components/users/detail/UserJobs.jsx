import React from "react";
import JobsTable from "/imports/ui/components/jobs/JobsTable.jsx";
import Jobs from "/imports/api/jobs/jobs.coffee";
import UsersSupervisorJobContainer from "/imports/ui/containers/users/UsersSupervisorJobContainer.jsx";
import { Button, Segment, Divider, Header } from "semantic-ui-react";

export default class UserJobs extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { userId } = this.props;
    return (
      <div>
        <UsersSupervisorJobContainer userId={userId} />
        <JobsTable selector={{ $or: [{ "data.userId": userId }] }} />
      </div>
    );
  }
}
