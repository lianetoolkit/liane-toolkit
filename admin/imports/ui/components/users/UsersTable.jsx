import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import UsersLink from "/imports/ui/components/users/UsersLink.jsx";
import { booleanToIcon, getLabelForRole } from "/imports/ui/utils/utils.jsx";

export default class UsersTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={Meteor.users}
        publication="admin.users"
        selector={selector}
        searchableFields={["emails.address"]}
        title="Users"
        orderBy={{ field: "createdAt", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          {
            label: "Created At",
            data: "createdAt",
            orderable: true
          },
          {
            label: "user",
            data: "_id",
            render: user => {
              return (
                <UsersLink email={user.emails[0].address} userId={user._id} />
              );
            }
          },
          {
            label: "Verified",
            data: "emails",
            render: user => {
              return (
                <div>
                  {booleanToIcon(user.emails[0].verified)}
                </div>
              );
            }
          },
          {
            label: "CustomerId",
            data: "customerId"
          },
          {
            label: "Country",
            data: "countryCode"
          },
          {
            label: "Banned",
            data: "banned",
            render: user => {
              return (
                <div>
                  {booleanToIcon(!user.banned)}
                </div>
              );
            }
          },
          {
            label: "Roles",
            data: "roles",
            searchable: false,
            render: user => {
              const role = user.roles && user.roles[0];
              return (
                <div>
                  {role ? getLabelForRole(role) : ""}
                </div>
              );
            }
          }
        ]}
      />
    );
  }
}
