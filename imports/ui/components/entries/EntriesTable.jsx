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
                  <div style={{"maxWidth": "400px"}}>
                    <span>
                      {entry.message.split("\n").map((item, key) => (
                        <span key={key}>
                          {item} <br />
                        </span>
                      ))}
                    </span>
                  </div>
                );
              }
              return null;
            }
          },
          {
            label: "Shares",
            orderable: true,
            data: "counts.shares",
            render: entry => {
              return entry.counts.shares;
            }
          },
          {
            label: "Likes",
            orderable: true,
            data: "counts.likes",
            render: entry => {
              return entry.counts.likes;
            }
          },
          {
            label: "Comments",
            orderable: true,
            data: "counts.comments",
            render: entry => {
              return entry.counts.comments;
            }
          }
        ]}
      />
    );
  }
}
