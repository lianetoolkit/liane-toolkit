import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { Popup, Icon, Label } from "semantic-ui-react";
import { People } from "/imports/api/facebook/people/people.js";
import PeopleMetaButtons from "./PeopleMetaButtons.jsx";

export default class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {
      loading,
      facebookAccount,
      currentUser,
      selector,
      hideHeader
    } = this.props;
    let orderBy = { field: "createdAt", ordering: -1 };
    let columns = [
      {
        label: "",
        data: "campaignMeta",
        render: person => {
          return <PeopleMetaButtons person={person} />;
        }
      },
      {
        label: "Name",
        orderable: true,
        data: "name"
      }
    ];
    if (facebookAccount) {
      orderBy = { field: `counts.${facebookAccount}.likes`, ordering: -1 };
      columns = columns.concat([
        {
          label: "Likes",
          orderable: true,
          data: `counts.${facebookAccount}.likes`,
          render: person => {
            return (
              <div>
                {person.counts[facebookAccount].likes}
                {person.counts[facebookAccount].reactions ? (
                  <Label.Group size="mini">
                    {Object.keys(person.counts[facebookAccount].reactions).map(
                      key => {
                        let count =
                          person.counts[facebookAccount].reactions[key];
                        if (count) {
                          return (
                            <Label key={facebookAccount + key}>
                              {key}
                              <Label.Detail>{count}</Label.Detail>
                            </Label>
                          );
                        } else {
                          return null;
                        }
                      }
                    )}
                  </Label.Group>
                ) : null}
              </div>
            );
          }
        },
        {
          label: "Comments",
          orderable: true,
          data: `counts.${facebookAccount}.comments`,
          render: person => {
            return person.counts[facebookAccount].comments;
          }
        }
      ]);
    }
    return (
      <SmartTable
        collection={People}
        publication="people.byAccount"
        selector={selector}
        extraFields={["counts"]}
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
        orderBy={orderBy}
        hideHeader={hideHeader}
        columns={columns}
      />
    );
  }
}
