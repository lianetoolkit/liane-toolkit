import React from "react";
import { Header, Statistic } from "semantic-ui-react";
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
      infos: []
    };
  }
  componentDidMount() {
    this._fetch();
  }
  _queries = () => {
    const { facebookId } = this.props;
    return [
      {
        title: "In Total",
        query: {}
      },
      {
        title: "Interacted through Facebook",
        query: {
          facebookAccounts: { $in: [facebookId] }
        }
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
        title: "Can receive private reply",
        query: {
          canReceivePrivateReply: { $in: [facebookId] }
        }
      },
      {
        title: "Marked as donor",
        query: {
          ["campaignMeta.donor"]: true
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
    ];
  };
  _fetch() {
    const { campaignId, facebookId } = this.props;
    Meteor.call(
      "people.summaryCounts",
      { campaignId, facebookId, queries: this._queries().map(q => q.query) },
      (err, res) => {
        if (!err) {
          this.setState({ infos: res });
        } else {
          console.log(err);
        }
      }
    );
  }
  render() {
    const { infos } = this.state;
    const queries = this._queries();
    return (
      <Wrapper>
        <Header as="h2">People Data Summary</Header>
        {infos.length ? (
          <Statistic.Group horizontal>
            {queries.map((q, i) => (
              <Statistic>
                <Statistic.Value>{infos[i]}</Statistic.Value>
                <Statistic.Label>{q.title}</Statistic.Label>
              </Statistic>
            ))}
          </Statistic.Group>
        ) : null}
      </Wrapper>
    );
  }
}
