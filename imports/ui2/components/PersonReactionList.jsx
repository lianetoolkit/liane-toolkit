import React, { Component } from "react";
import styled from "styled-components";
import { alertStore } from "../containers/Alerts.jsx";
import Loading from "./Loading.jsx";
import EntryReactionList from "./EntryReactionList.jsx";
import PagePaging from "../components/PagePaging.jsx";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  height: 100%;
  .page-paging {
    flex: 0 0 auto;
    background: #f7f7f7;
    padding: 0 1rem;
  }
  .entry-reaction-container {
    flex: 1 1 100%;
    overflow: auto;
  }
`;

export default class PersonReactionList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reactions: [],
      loading: false,
      loadingCount: false,
      count: 0,
      options: {
        skip: 0,
        limit: 10
      }
    };
  }
  componentDidMount() {
    this._fetch();
  }
  componentDidUpdate(prevProps, prevState) {
    const { options } = this.state;
    if (JSON.stringify(options) != JSON.stringify(prevState.options)) {
      this._fetch();
    }
  }
  _fetch() {
    const { personId } = this.props;
    const { options } = this.state;
    this.setState({ loading: true });
    Meteor.call("likes.byPerson", { personId, ...options }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          reactions: res
        });
      }
      this.setState({ loading: false });
    });
    this.setState({ loadingCount: true });
    Meteor.call("likes.byPerson.count", { personId }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          count: res
        });
      }
      this.setState({ loadingCount: false });
    });
  }
  _handleNext = () => {
    const { options, count } = this.state;
    if (options.skip * options.limit + options.limit < count) {
      this.setState({
        options: {
          ...options,
          skip: options.skip + 1
        }
      });
    }
  };
  _handlePrev = () => {
    const { options } = this.state;
    if (options.skip > 0) {
      this.setState({
        options: {
          ...options,
          skip: options.skip - 1
        }
      });
    }
  };
  render() {
    const { count, loadingCount, loading, reactions, options } = this.state;
    return (
      <Container>
        <PagePaging
          skip={options.skip}
          limit={options.limit}
          count={count}
          loading={loadingCount}
          onNext={this._handleNext}
          onPrev={this._handlePrev}
        />
        {loading ? (
          <Loading full />
        ) : (
          <EntryReactionList reactions={reactions} />
        )}
      </Container>
    );
  }
}
