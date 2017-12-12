import React from "react";
import SmartTable from "/imports/ui/components/utils/tables/SmartTable.jsx";
import { Entries } from "/imports/api/facebook/entries/entries.js";

export default class PeopleTable extends React.Component {
  constructor(props) {
    super(props);
    // console.log("UsersTable init", { props });
  }

  render() {
    const { loading, currentUser, selector, hideHeader } = this.props;
    return (
      <SmartTable
        collection={Entries}
        publication="entries.byAccount"
        selector={selector}
        title="Entries"
        limit={20}
        orderBy={{ field: "updatedTime", ordering: -1 }}
        hideHeader={hideHeader}
        columns={[
          {
            label: "Message",
            data: "message",
            render: entry => {
              if(entry.message) {
                return (
                  <span>
                    {entry.message.split("\n").map((item, key) => (
                      <span key={key}>
                        {item} <br />
                      </span>
                    ))}
                  </span>
                );
              }
              return null;
            }
          },
          {
            label: "Shares",
            data: "counts",
            render: entry => {
              return entry.counts.shares;
            }
          },
          {
            label: "Likes",
            data: "counts",
            render: entry => {
              return entry.counts.likes;
            }
          },
          {
            label: "Comments",
            data: "counts",
            render: entry => {
              return entry.counts.comments;
            }
          }
        ]}
      />
    );
  }
}
