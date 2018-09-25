import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import { Grid, Header, Statistic } from "semantic-ui-react";
import styled from "styled-components";

const Wrapper = styled.div`
  .ui.horizontal.statistics .ui.statistic {
    width: 100%;
    margin: 0 0 -1px;
  }
  .ui.statistic .value {
    width: 150px;
    border: 1px solid #999;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
`;

export default class PeopleSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      infos: {},
      loading: false
    };
  }
  componentDidMount() {
    this._fetch();
  }
  componentWillReceiveProps(nextProps) {
    const { facebookId } = this.props;
    if (nextProps.facebookId && facebookId !== nextProps.facebookId) {
      this._fetch(nextProps.facebookId);
    }
  }
  _queries = facebookId => {
    facebookId = facebookId || this.props.facebookId;
    return {
      general: [
        {
          title: "In Total",
          query: {}
        },
        {
          title: "Received automatic private reply",
          query: {
            receivedAutoPrivateReply: true
          }
        },
        {
          title: "Filled CRM form",
          query: {
            filledForm: true
          }
        },
        {
          title: "Marked as donor",
          query: {
            ["campaignMeta.donor"]: true
          }
        }
      ],
      account: [
        {
          title: "Interacted through Facebook",
          query: {
            facebookAccounts: { $in: [facebookId] }
          }
        },
        {
          title: "Can receive private reply",
          query: {
            canReceivePrivateReply: { $in: [facebookId] }
          }
        },
        {
          title: "With at least 5 reactions",
          query: {
            [`counts.${facebookId}.likes`]: { $gte: 5 }
          }
        },
        {
          title: "With at least 5 comments",
          query: {
            [`counts.${facebookId}.comments`]: { $gte: 5 }
          }
        }
      ]
    };
    return [];
  };
  _fetch(facebookId) {
    const { campaignId } = this.props;
    facebookId = facebookId || this.props.facebookId;
    this.setState({
      loading: true
    });
    const queries = this._queries(facebookId);
    for (let key in queries) {
      Meteor.call(
        "people.summaryCounts",
        { campaignId, facebookId, queries: queries[key].map(q => q.query) },
        (err, res) => {
          this.setState({
            infos: {
              ...this.state.infos,
              [key]: res
            },
            loading: false
          });
        }
      );
    }
  }
  _queryGroupName(key) {
    switch (key) {
      case "general":
        return "General";
      case "account":
        return "Facebook account";
    }
  }
  render() {
    const { infos, loading } = this.state;
    const queries = this._queries();
    return (
      <Wrapper>
        <Header as="h2">People Data Summary</Header>
        {loading ? (
          <Loading />
        ) : (
          <Grid columns={Object.keys(queries).length}>
            <Grid.Row>
              {Object.keys(queries).map(queryGroup => (
                <Grid.Column key={queryGroup}>
                  <Header as="h3">{this._queryGroupName(queryGroup)}</Header>
                  <Statistic.Group horizontal>
                    {queries[queryGroup].map((q, i) => (
                      <Statistic key={i}>
                        <Statistic.Value>
                          {!infos[queryGroup] || isNaN(infos[queryGroup][i])
                            ? "--"
                            : infos[queryGroup][i]}
                        </Statistic.Value>
                        <Statistic.Label>{q.title}</Statistic.Label>
                      </Statistic>
                    ))}
                  </Statistic.Group>
                </Grid.Column>
              ))}
            </Grid.Row>
          </Grid>
        )}
      </Wrapper>
    );
  }
}
