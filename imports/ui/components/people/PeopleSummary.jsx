import React from "react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
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
      infos: [],
      loading: false
    };
  }
  componentDidMount() {
    this._fetch();
  }
  componentWillReceiveProps(nextProps) {
    const { facebookId } = this.props;
    if (nextProps.facebookId && facebookId !== nextProps.facebookId) {
      this._fetch();
    }
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
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.summaryCounts",
      { campaignId, facebookId, queries: this._queries().map(q => q.query) },
      (err, res) => {
        this.setState({
          infos: err ? [] : res,
          loading: false
        });
      }
    );
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
          <Statistic.Group horizontal>
            {queries.map((q, i) => (
              <Statistic key={i}>
                <Statistic.Value>
                  {isNaN(infos[i]) ? "--" : infos[i]}
                </Statistic.Value>
                <Statistic.Label>{q.title}</Statistic.Label>
              </Statistic>
            ))}
          </Statistic.Group>
        )}
      </Wrapper>
    );
  }
}
