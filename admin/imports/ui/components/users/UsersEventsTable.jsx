import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import UsersLink from "/imports/ui/components/users/UsersLink.jsx";
import { booleanToIcon, getLabelForRole } from "/imports/ui/utils/utils.jsx";
import { UsersEvents } from "/imports/api/users/usersEvents.js";

export default class UsersEventsTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersEventsTable init", { props });
  }

  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={UsersEvents}
        publication="admin.usersEvents"
        selector={selector}
        title="UsersEvents"
        orderBy={{ field: "createdAt", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          { label: "ID", data: "_id" },
          { label: "Created At", data: "createdAt", orderable: true },
          {
            label: "user",
            data: "userId",
            render: userEvent => {
              return <UsersLink userId={userEvent.userId} />;
            }
          },
          { label: "type", data: "eventType", searchable: true },
          {
            label: "serviceAccountId",
            data: "extraFields.serviceAccountId",
            searchable: false
          },
          {
            label: "emailType",
            data: "extraFields.emailType",
            searchable: false
          }
        ]}
      />
    );
  }
}
