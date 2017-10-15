import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { Proxies } from "/imports/api/proxies/proxies.js";
import { Label } from "semantic-ui-react";

export default class ProxiesTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <SmartTable
        collection={Proxies}
        publication="admin.proxies"
        searchableFields={["ip", "provider"]}
        title="Proxies"
        orderBy={{ field: "createdAt", ordering: -1 }}
        columns={[
          {
            label: "ID",
            data: "_id"
          },
          {
            label: "IP",
            data: "ip"
          },
          {
            label: "portHttp",
            data: "portHttp"
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
            label: "Created At",
            data: "createdAt",
            orderable: true
          },
          {
            label: "Stats(total,%)",
            data: "stats",
            render: proxy => {
              return (
                <Label.Group circular>
                  <Label color="blue">
                    {proxy.stats ? proxy.stats.total : 0}
                  </Label>
                  <Label color="green">
                    {proxy.stats ? proxy.stats.successRatio : 0}%
                  </Label>
                </Label.Group>
              );
            }
          }
        ]}
      />
    );
  }
}
