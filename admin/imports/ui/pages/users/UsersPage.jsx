import React from "react";
import PageHeader from "/imports/ui/components/admin/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";

import UsersTable from "/imports/ui/components/users/UsersTable.jsx";

export default class UsersPage extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersPage init", { props });
  }

  render() {
    const { loading, currentUser } = this.props;
    return (
      <div>
        <PageHeader title="Users" />
        <section className="content">
          {loading ? <Loading /> : <UsersTable />}
        </section>
      </div>
    );
  }
}
