import React from "react";
import PageHeader from "/imports/ui/components/app/PageHeader.jsx";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import styled from "styled-components";
import { pick, sortBy, minBy, maxBy } from "lodash";
import {
  Segment,
  Grid,
  Header,
  Icon,
  Button,
  Divider,
  Menu
} from "semantic-ui-react";
import PeopleInteractivityItem from "/imports/ui/components/people/PeopleInteractivityItem.jsx";
import PeopleMetaButtons from "/imports/ui/components/people/PeopleMetaButtons.jsx";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";
import moment from "moment";
import PeopleMetaModel from "/imports/api/facebook/people/model/meta";
import FlexDataItem from "/imports/ui/components/flexData/FlexDataItem.jsx";
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
      text-align: center;
      color: #999;
      h4 {
        font-size: 0.8em;
        color: #666;
        line-height: 1.2;
        padding: 0.5rem;
      }
      img,
      .icon {
        display: inline-block;
        float: left;
        margin-right: 0.5rem;
        color: #333;
      }
    }
  }
  .person-data {
    .segments,
    .segment {
      margin-top: 0;
    }
  }
`;

const MetaItem = styled.div`
  > .flex-data-item {
    width: 33.3333%;
    float: left;
    box-sizing: border-box;
    padding-right: 2rem;
    &.group,
    &.repeater {
      width: auto;
      float: none;
      padding-right: 0;
      &:before,
      &:after {
        content: "";
        clear: both;
        display: table;
      }
    }
  }
`;

const reactions = ["like", "love", "wow", "haha", "sad", "angry"];

export default class PeopleSinglePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nav: "intro"
    };
    this._nav = this._nav.bind(this);
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
  _nav(nav) {
    return () => {
      this.setState({ nav });
    };
  }
  _fieldData(section, field) {
    const { person } = this.props;
    let value;
    if (person.campaignMeta && person.campaignMeta[section.key]) {
      value = person.campaignMeta[section.key][field.key];
    }
    return { value };
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
    const { entries, nav } = this.state;
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
                    <Grid.Column width={4}>
                      <PeopleMetaButtons person={person} size="large" />
                    </Grid.Column>
                    <Grid.Column width={12}>
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
                          <Header>Never commented</Header>
                        </div>
                      )}
                    </Grid.Column>
                  </Grid.Row>
                </Grid>
              </Segment>
              <Segment size="small" className="interactions-summary">
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
                        {person.counts[account.facebookId] ? (
                          <span>
                            {person.counts[account.facebookId].comments || 0}
                          </span>
                        ) : (
                          <span>0</span>
                        )}
                      </Grid.Column>
                      {reactions.map(reaction => (
                        <Grid.Column key={reaction}>
                          <Reaction size="small" reaction={reaction} />
                          {person.counts[account.facebookId] &&
                          person.counts[account.facebookId].reactions ? (
                            <span>
                              {
                                person.counts[account.facebookId].reactions[
                                  reaction
                                ]
                              }
                            </span>
                          ) : (
                            <span>0</span>
                          )}
                        </Grid.Column>
                      ))}
                    </Grid.Row>
                  </Grid>
                ))}
              </Segment>
            </Segment.Group>
            <div className="person-data">
              <Menu pointing attached="top">
                <Menu.Item active={nav == "intro"} onClick={this._nav("intro")}>
                  Information
                </Menu.Item>
                <Menu.Item
                  active={nav == "activity"}
                  onClick={this._nav("activity")}
                >
                  Activity
                </Menu.Item>
              </Menu>
              {nav == "intro" ? (
                <Segment.Group>
                  {PeopleMetaModel.map(section => (
                    <Segment key={section.key} clearing>
                      <Header floated="left">{section.title}</Header>
                      <Button
                        as="a"
                        primary
                        floated="right"
                        href={FlowRouter.path("App.campaignPeople.edit", {
                          campaignId: campaign._id,
                          personId: person._id,
                          sectionKey: section.key
                        })}
                      >
                        <Icon name="edit" />
                        Edit
                      </Button>
                      <Divider clearing hidden />
                      <MetaItem>
                        {section.fields.map(field => (
                          <FlexDataItem
                            key={field.key}
                            field={field}
                            data={this._fieldData(section, field)}
                          />
                        ))}
                      </MetaItem>
                    </Segment>
                  ))}
                </Segment.Group>
              ) : null}
              {nav == "activity" ? (
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
              ) : null}
            </div>
          </section>
        </Wrapper>
      );
    }
  }
}
