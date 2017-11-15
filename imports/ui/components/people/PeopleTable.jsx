import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { People } from "/imports/api/facebook/people/people.js";

export default class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={People}
        publication="people.byAccount"
        selector={selector}
        title="People"
        limit={20}
        orderBy={{ field: "likesCount", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          {
            label: "Name",
            data: "name"
          },
          {
            label: "FacebookId",
            data: "facebookId"
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
