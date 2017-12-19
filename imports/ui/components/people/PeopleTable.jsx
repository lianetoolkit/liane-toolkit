import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { Popup, Icon } from "semantic-ui-react";
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
        filters={[
          {
            title: "Flags",
            icon: true,
            items: [
              {
                name: "Influencers",
                render: (filter, active) => (
                  <Popup
                    trigger={<Icon fitted name="certificate" />}
                    content="Influencers"
                  />
                ),
                field: "campaignMeta.influencer",
                value: true
              },
              {
                name: "Starred",
                render: (filter, active) => (
                  <Popup
                    trigger={<Icon fitted name="star" />}
                    content="Starred"
                  />
                ),
                field: "campaignMeta.starred",
                value: true
              },
              {
                name: "Electorate",
                render: (filter, active) => (
                  <Popup
                    trigger={<Icon fitted name="thumbs up" />}
                    content="Electorate"
                  />
                ),
                field: "campaignMeta.voteIntent",
                value: true
              },
              {
                name: "Trolls",
                render: (filter, active) => (
                  <Popup
                    trigger={<Icon fitted name="dont" />}
                    content="Trolls"
                  />
                ),
                field: "campaignMeta.troll",
                value: true
              }
            ]
          }
        ]}
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
            orderable: true,
            data: "name"
          },
          {
            label: "Likes",
            orderable: true,
            data: "likesCount"
          },
          {
            label: "Comments",
            orderable: true,
            data: "commentsCount"
          }
        ]}
      />
    );
  }
}
