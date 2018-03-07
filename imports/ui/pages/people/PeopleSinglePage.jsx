import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import { pick, sortBy, minBy, maxBy } from "lodash";
import { Segment, Grid, Header, Icon } from "semantic-ui-react";
import PeopleInteractivityItem from "/imports/ui/components/people/PeopleInteractivityItem.jsx";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";
import moment from "moment";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const Wrapper = styled.div`
  .comment-history {
    .ui.header {
      font-size: 1em;
      margin: 0;
    }
  }
  .interactions-summary {
    .grid {
      font-size: 1.6em;
      text-align: center;
      color: #999;
      h4 {
        font-size: 0.5em;
        background: #f7f7f7;
        color: #666;
        line-height: 1.2;
        padding: 0.5rem;
      }
      img,
      .icon {
        display: inline-block;
        margin-right: 1rem;
        color: #333;
      }
    }
  }
`;

const reactions = ["like", "love", "wow", "haha", "sad", "angry"];

export default class PeopleSinglePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    this._buildEntries();
  }
  componentWillReceiveProps(nextProps) {
    const { likes, comments } = this.props;
    if (likes != nextProps.likes || comments != nextProps.comments) {
      this._buildEntries(nextProps);
    }
  }
  _firstComment() {
    const { comments } = this.props;
    return minBy(comments, c => c.created_time);
  }
  _lastComment() {
    const { comments } = this.props;
    return maxBy(comments, c => c.created_time);
  }
  _buildEntries(props) {
    const { likes, comments } = props || this.props;
    let entries = {};
    if (likes) {
      for (const like of likes) {
        if (!entries[like.entryId]) {
          entries[like.entryId] = like.entry;
        }
        entries[like.entryId]["like"] = like.type;
      }
    }
    if (comments) {
      for (const comment of comments) {
        const picked = pick(comment, ["_id", "message", "created_time"]);
        if (!entries[comment.entryId]) {
          entries[comment.entryId] = comment.entry;
        }
        if (entries[comment.entryId]["comments"]) {
          entries[comment.entryId]["comments"].push(picked);
        } else {
          entries[comment.entryId]["comments"] = [picked];
        }
      }
    }
    this.setState({
      entries: sortBy(Object.values(entries), e => -e.createdTime)
    });
  }
  render() {
    const { entries } = this.state;
    const { loading, campaign, person, likes, comments } = this.props;
    if (loading) {
      return <Loading />;
    } else {
      return (
        <Wrapper>
          <PageHeader
            title={`Campaign: ${campaign ? campaign.name : ""}`}
            titleTo={FlowRouter.path("App.campaignDetail", {
              campaignId: campaign ? campaign._id : ""
            })}
            subTitle={person.name}
          />
          <section className="content">
            <Segment.Group>
              <Segment size="small">
                <Grid columns={3}>
                  <Grid.Row>
                    <Grid.Column width={3}>
                      <PeopleMetaButtons person={person} size="large" />
                    </Grid.Column>
                    <Grid.Column width={13}>
                      {comments.length ? (
                        <div className="comment-history">
                          <Header>
                            First commented{" "}
                            <strong>
                              {moment(this._firstComment().created_time).format(
                                "DD/MM/YYYY"
                              )}
                            </strong>{" "}
                            and most recently commented{" "}
                            <strong>
                              {moment(this._lastComment().created_time).format(
                                "DD/MM/YYYY"
                              )}
                            </strong>.
                          </Header>
                        </div>
                      ) : (
                        <div className="comment-history">
                          <Header>Person never commented</Header>
                        </div>
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
              <Segment className="interactions-summary">
                <Header>Interactions</Header>
                {campaign.accounts.map(account => (
                  <Grid
                    key={account._id}
                    widths="equal"
                    columns={8}
                    verticalAlign="middle"
                  >
                    <Grid.Row>
                      <Grid.Column>
                        <Header as="h4">{account.name}</Header>
                      </Grid.Column>
                      <Grid.Column>
                        <Icon name="comment" />
                        {person.counts[account.facebookId].comments || 0}
                      </Grid.Column>
                      {reactions.map(reaction => (
                        <Grid.Column key={reaction}>
                          <Reaction reaction={reaction} />
                          {
                            person.counts[account.facebookId].reactions[
                              reaction
                            ]
                          }
                        </Grid.Column>
                      ))}
                    </Grid.Row>
                  </Grid>
                ))}
              </Segment>
              {/* <Segment>
                <Header>Information</Header>

              </Segment> */}
              <Segment>
                <Header>All activity</Header>
                {entries.map(entry => (
                  <PeopleInteractivityItem
                    key={entry._id}
                    entry={entry}
                    comments={entry.comments}
                    like={entry.like}
                  />
                ))}
              </Segment>
            </Segment.Group>
          </section>
        </Wrapper>
      );
    }
  }
}
