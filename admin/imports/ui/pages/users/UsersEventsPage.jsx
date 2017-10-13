import React from "react";
import PageHeader from "/imports/ui/components/admin/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import UsersEventsTable
  from "/imports/ui/components/users/UsersEventsTable.jsx";

export default class UsersEventsPage extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersEventsPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Users" />
        <section className="content">
          {loading ? <Loading /> : <UsersEventsTable />}
        </section>
      </div>
    );
  }
}
