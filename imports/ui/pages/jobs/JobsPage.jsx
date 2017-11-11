import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import JobsTable from "/imports/ui/components/jobs/JobsTable.jsx";

export default class JobsPage extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Jobs" />
        <section className="content">
          {loading ? <Loading /> : <JobsTable />}
        </section>
      </div>
    );
  }
}
