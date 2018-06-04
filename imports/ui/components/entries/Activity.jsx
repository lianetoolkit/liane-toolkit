import React from "react";
import styled from "styled-components";
import { Feed, Icon, Message } from "semantic-ui-react";
import moment from "moment";

import Reaction from "./Reaction.jsx";
import Entry from "./Entry.jsx";

const Wrapper = styled.div`
  .ui.feed {
    .event {
      .date {
        a {
          color: inherit;
          border-bottom: 1px dashed #ccc;
          &:hover {
            color: #000;
            border-color: #666;
          }
        }
      }
    }
  }
`;

const EntryWrapper = styled.div`
  background: #f7f7f7;
  border: 1px solid #ddd;
  color: #999;
  padding: 0.5rem;
  font-size: 0.8em;
  .entry-content {
    margin: 0;
  }
`;

export default class PeopleActivity extends React.Component {
  constructor(props) {
    super(props);
  }
  _getEntryUrl(item) {
    let ids = item.entryId.split("_");
    return `https://facebook.com/${ids[0]}/posts/${ids[1]}`;
  }
  _getCommentUrl(item) {
    let ids = item.entryId.split("_");
    ids = ids.concat(item._id.split("_")[1]);
    return `https://facebook.com/${ids[0]}/posts/${ids[1]}?comment_id=${
      ids[2]
    }`;
  }
  _getAction(item) {
    let link = (
      <a target="_blank" rel="external" href={this._getEntryUrl(item)}>
        post
      </a>
    );
    switch (item.type) {
      case "comment":
        return <span>commented a {link}</span>;
      default:
        return <span>reacted to a {link}</span>;
    }
  }
  _getIcon(item) {
    if (item.type == "comment") {
      return <Icon name="comment" />;
    } else {
      return <Reaction size="medium" reaction={item.type} />;
    }
  }
  _getAccountLink(item) {
    const { accounts } = this.props;
    const account = accounts.find(
      acc => item.facebookAccountId == acc.facebookId
    );
    if (account) {
      return (
        <a
          rel="external"
          target="_blank"
          href={`https://facebook.com/${account.facebookId}`}
        >
          {account.name}
        </a>
      );
    }
  }
  _goToPerson = item => () => {
    const { campaign } = this.props;
    Meteor.call(
      "people.getPersonIdFromFacebook",
      {
        campaignId: campaign._id,
        facebookId: item.personId
      },
      (err, res) => {
        FlowRouter.go("App.campaignPeople.detail", {
          campaignId: campaign._id,
          personId: res._id
        });
      }
    );
  };
  render() {
    console.log(this.props);
    const { activity } = this.props;
    if (activity && activity.length) {
      return (
        <Wrapper>
          <Feed>
            {activity.map(item => (
              <Feed.Event key={item._id}>
                <Feed.Label>{this._getIcon(item)}</Feed.Label>
                <Feed.Content>
                  <Feed.Summary>
                    <Feed.User onClick={this._goToPerson(item)}>
                      {item.name}
                    </Feed.User>{" "}
                    {this._getAction(item)} on {this._getAccountLink(item)}
                    <Feed.Date>
                      {item.type == "comment" ? (
                        <a
                          target="_blank"
                          rel="external"
                          href={this._getCommentUrl(item)}
                        >
                          {moment(item.created_time).fromNow()}
                        </a>
                      ) : (
                        moment(item.created_time).fromNow()
                      )}
                    </Feed.Date>
                  </Feed.Summary>
                  {item.type == "comment" ? (
                    <Feed.Extra text>{item.message}</Feed.Extra>
                  ) : null}
                  <Feed.Extra>
                    <EntryWrapper>
                      <Entry entry={item.entry} />
                    </EntryWrapper>
                  </Feed.Extra>
                </Feed.Content>
              </Feed.Event>
            ))}
          </Feed>
        </Wrapper>
      );
    } else {
      return <Message>No activity was found</Message>;
    }
  }
}
