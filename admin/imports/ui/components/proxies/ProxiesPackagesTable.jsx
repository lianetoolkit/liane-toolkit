import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import ProxiesPackagesUpdate from "/imports/ui/components/proxies/ProxiesPackagesUpdate.jsx";
import { ProxiesPackages } from "/imports/api/proxies/proxiesPackages.js";

export default class ProxiesPackagesTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { userId } = this.props;
    return (
      <SmartTable
        collection={ProxiesPackages}
        publication="admin.proxiesPackages"
        searchableFields={["packageId"]}
        title="Proxies Packages"
        orderBy={{ field: "createdAt", ordering: -1 }}
        columns={[
          {
            label: "packageId",
            data: "packageId"
          },
          {
            label: "provider",
            data: "provider"
          },
          {
            label: "active",
            data: "active"
          },
          {
            label: "quantity",
            data: "quantity"
          },
          {
            label: "Created At",
            data: "createdAt"
          },
          {
            label: "Actions",
            data: "_id",
            render: proxiesPackage => {
              return (
                <ProxiesPackagesUpdate packageId={proxiesPackage.packageId} />
              );
            }
          }
        ]}
      />
    );
  }
}
