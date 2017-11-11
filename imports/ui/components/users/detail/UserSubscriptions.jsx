import React from "react";
import { Subscriptions } from "/imports/api/subscriptions/subscriptions.coffee";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";

export default class UserSubscriptions extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { userId } = this.props;
    return (
      <SmartTable
        collection={Subscriptions}
        publication="admin.subscriptions"
        selector={{ userId }}
        searchableFields={["btSubscriptionsId"]}
        title="Subscriptions"
        orderBy={{ field: "createdAt", ordering: -1 }}
        columns={[
          {
            label: "ID",
            data: "_id"
          },
          {
            label: "btSubscriptionId",
            data: "btSubscriptionId"
          },
          {
            label: "Created At",
            data: "createdAt",
            orderable: true
          }
        ]}
      />
    );
  }
}
