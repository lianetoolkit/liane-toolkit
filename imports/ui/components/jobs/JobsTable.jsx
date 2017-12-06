import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { Jobs } from "/imports/api/jobs/jobs.js";

export default class JobsTable extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { selector } = this.props;
    return (
      <SmartTable
        collection={Jobs}
        selector={selector}
        publication="admin.jobs"
        title="Jobs"
        orderBy={{ field: "created", ordering: -1 }}
        columns={[
          { label: "Type", data: "type" },
          { label: "ID", data: "_id" },
          { label: "Status", data: "status", searchable: true },
          {
            label: "Attempts",
            data: "retried"
          },
          {
            label: "Maximum Attempts",
            data: "repeatRetries"
          },
          { label: "Updated", data: "updated", orderable: true },
          { label: "Ready to run", data: "after" }
        ]}
      />
    );
  }
}
