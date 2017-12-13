import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleMetaButtons from "./PeopleMetaButtons.jsx";

export default class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={People}
        publication="people.byAccount"
        selector={selector}
        // extraFields={["_id"]}
        title="People"
        limit={20}
        orderBy={{ field: "likesCount", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          {
            label: "",
            data: "campaignMeta",
            render: person => <PeopleMetaButtons person={person} />
          },
          {
            label: "Name",
            data: "name"
          },
          {
            label: "Likes",
            data: "likesCount"
          },
          {
            label: "Comments",
            data: "commentsCount"
          }
        ]}
      />
    );
  }
}
