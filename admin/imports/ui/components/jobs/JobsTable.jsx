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
          { label: "ID", data: "_id" },
          { label: "runId", data: "runId" },
          { label: "type", data: "type" },
          {
            label: "userId",
            data: "data.userId",
            searchable: true
          },
          {
            label: "serviceAccountId",
            data: "data.serviceAccountId",
            searchable: true
          },
          { label: "status", data: "status", searchable: true },
          { label: "retried", data: "retried" },
          { label: "repeatRetries", data: "repeatRetries" },
          { label: "updated", data: "updated", orderable: true },
          { label: "after", data: "after" }
        ]}
      />
    );
  }
}
