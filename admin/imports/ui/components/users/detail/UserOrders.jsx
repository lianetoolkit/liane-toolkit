import React from "react";
import { Orders } from "/imports/api/orders/orders.coffee";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";

export default class UserOrders extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { userId } = this.props;
    return (
      <SmartTable
        collection={Orders}
        publication="admin.orders.byUser"
        selector={{ userId }}
        searchableFields={["btSubscriptionsId"]}
        title="Orders"
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
