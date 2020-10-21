import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { debounce } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Form from "../components/Form.jsx";
import Page from "../components/Page.jsx";
import PageFilters from "../components/PageFilters.jsx";
import PagePaging from "../components/PagePaging.jsx";
import Button from "../components/Button.jsx";
import EntrySelect from "../components/EntrySelect.jsx";
import CommentSourceSelect from "../components/CommentSourceSelect.jsx";
import CommentList from "../components/CommentList.jsx";

const messages = defineMessages({
  textSearch: {
    id: "app.comments.text_search_placeholder",
    defaultMessage: "Text search..."
  },
  postFilter: {
    id: "app.comments.entry_select_placeholder",
    defaultMessage: "Filter by post..."
  },
  commentSourceFilter: {
    id: "app.comments.source_select_placeholder",
    defaultMessage: "Filter by source..."
  }
});

const Container = styled.div`
  width: 100%;
  display: flex;
  .filters {
    padding-top: 1rem;
    .button-group {
      margin: 0 0 1rem;
      font-size: 0.9em;
      white-space: nowrap;
      .button {
        padding: 0.5rem 0.7rem;
      }
    }
  }
`;

const CommentsContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .comments {
    flex: 1 1 100%;
    overflow-x: hidden;
    overflow-y: auto;
    transition: opacity 0.1s linear;
    background: #fff;
  }
  .not-found {
    font-size: 1.5em;
    font-style: italic;
    color: #ccc;
    text-align: center;
    margin: 4rem;
  }
  ${props =>
    props.loading &&
    css`
      .comments {
        opacity: 0.25;
      }
    `}
  .page-paging {
  }
`;

class CommentsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      count: 0,
      personMeta: {}
    };
  }
  componentDidMount() {
    this._fetchCount();
  }
  componentDidUpdate(prevProps) {
    const { query, comments } = this.props;
    if (
      JSON.stringify(query) != JSON.stringify(prevProps.query) ||
      JSON.stringify(comments) != JSON.stringify(prevProps.comments)
    ) {
      this._fetchCount();
      ReactTooltip.rebuild();
    }
  }
  _fetchCount = debounce(() => {
    const { campaignId, query } = this.props;
    this.setState({
      loadingCount: true
    });
    Meteor.call(
      "comments.queryCount",
      {
        campaignId,
        query
      },
      (err, res) => {
        if (!err) {
          this.setState({
            count: res,
            loadingCount: false
          });
        }
      }
    );
  }, 200);
  queryingCategory = () => {
    const { query } = this.props;
    const category = query.categories;
    if (typeof category == "object") {
      return category.$in[0];
    } else {
      return false;
    }
  };
  isQueryingResolved = () => {
    const { query } = this.props;
    return query.resolved == true;
  };
  isQueryingHideReplies = () => {
    const { query } = this.props;
    return !!query.parentId;
  };
  isQueryingMention = () => {
    const { query } = this.props;
    return !!query.message_tags;
  };
  isQueryingUnreplied = () => {
    const { query } = this.props;
    return !!query.adminReplied;
  };
  isQueryingPrivateReply = () => {
    const { query } = this.props;
    return !!query.can_reply_privately;
  };
  _handleChange = ({ target }) => {
    const value = target.value || null;
    FlowRouter.setQueryParams({ [target.name]: value, page: 1 });
  };
  _handleCheckboxChange = ({ target }) => {
    FlowRouter.setQueryParams({
      [target.name]: target.checked || null,
      page: 1
    });
  };
  _handleQueryResolveClick = resolved => ev => {
    ev.preventDefault();
    FlowRouter.setQueryParams({ resolved: resolved ? true : null, page: 1 });
  };
  _handleNext = () => {
    const { page, limit } = this.props;
    const { count } = this.state;
    if ((page - 1) * limit + limit < count) {
      FlowRouter.setQueryParams({ page: page + 1 });
    }
  };
  _handlePrev = () => {
    const { page } = this.props;
    if (page > 1) {
      FlowRouter.setQueryParams({ page: page - 1 });
    }
  };
  render() {
    const { intl, campaignId, comments, limit, page } = this.props;
    const { loadingCount, count } = this.state;
    const queryingCategory = this.queryingCategory();
    return (
      <Container>
        <Page.Nav full plain>
          <PageFilters>
            <div className="filters">
              <form onSubmit={ev => ev.preventDefault()}>
                <Button.Group toggler>
                  <Button
                    onClick={this._handleQueryResolveClick(false)}
                    active={!this.isQueryingResolved()}
                  >
                    <FormattedMessage
                      id="app.comments.unresolved_label"
                      defaultMessage="Unresolved"
                    />
                  </Button>
                  <Button
                    onClick={this._handleQueryResolveClick(true)}
                    active={this.isQueryingResolved()}
                  >
                    <FormattedMessage
                      id="app.comments.resolved_label"
                      defaultMessage="Resolved"
                    />
                  </Button>
                </Button.Group>
                <input
                  className="main-input"
                  type="text"
                  placeholder={intl.formatMessage(messages.textSearch)}
                  name="q"
                  onChange={this._handleChange}
                  // value={query.q}
                />
                <Form.Field>
                  <EntrySelect
                    name="entry"
                    onChange={this._handleChange}
                    value={FlowRouter.getQueryParam("entry")}
                    placeholder={intl.formatMessage(messages.postFilter)}
                  />
                </Form.Field>
                <Form.Field>
                  <CommentSourceSelect
                    name="source"
                    onChange={this._handleChange}
                    value={FlowRouter.getQueryParam("source")}
                    placeholder={intl.formatMessage(messages.commentSourceFilter)}
                  />
                </Form.Field>
                <PageFilters.Category hiddenInput>
                  <label className={!queryingCategory ? "active" : ""}>
                    <input
                      type="radio"
                      onChange={this._handleChange}
                      name="category"
                      value=""
                    />
                    <span className="icon">
                      <FontAwesomeIcon icon="dot-circle" />
                    </span>
                    <FormattedMessage
                      id="app.comments.filters.all_comments_label"
                      defaultMessage="All comments"
                    />
                  </label>
                  <label
                    className={queryingCategory == "question" ? "active" : ""}
                  >
                    <input
                      type="radio"
                      onChange={this._handleChange}
                      name="category"
                      value="question"
                    />
                    <span className="icon">
                      <FontAwesomeIcon icon="question" />
                    </span>
                    <FormattedMessage
                      id="app.comments.filters.question_comments"
                      defaultMessage="Marked as question"
                    />
                  </label>
                  <label className={queryingCategory == "vote" ? "active" : ""}>
                    <input
                      type="radio"
                      onChange={this._handleChange}
                      name="category"
                      value="vote"
                    />
                    <span className="icon">
                      <FontAwesomeIcon icon="thumbs-up" />
                    </span>
                    <FormattedMessage
                      id="app.comments.filters.vote_comments"
                      defaultMessage="Vote declarations"
                    />
                  </label>
                </PageFilters.Category>
                <label className="boxed">
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="hideReplies"
                    checked={this.isQueryingHideReplies()}
                    disabled={this.isQueryingUnreplied()}
                  />
                  <FormattedMessage
                    id="app.comments.filters.hide_replies"
                    defaultMessage="Hide comment replies"
                  />
                </label>
                <label className="boxed">
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="unreplied"
                    checked={this.isQueryingUnreplied()}
                  />
                  <FormattedMessage
                    id="app.comments.filters.without_response"
                    defaultMessage="Comments without page response"
                  />
                </label>
                <label className="boxed">
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="privateReply"
                    checked={this.isQueryingPrivateReply()}
                  />
                  <FormattedMessage
                    id="app.comments.filters.private_reply"
                    defaultMessage="Comments that can receive a private reply"
                  />
                </label>
                <label className="boxed">
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="mention"
                    checked={this.isQueryingMention()}
                  />
                  <FormattedMessage
                    id="app.comments.filters.with_mentions"
                    defaultMessage="Comments with mentions"
                  />
                </label>
              </form>
            </div>
          </PageFilters>
        </Page.Nav>
        <CommentsContent>
          <PagePaging
            skip={page - 1}
            limit={limit}
            count={count}
            loading={loadingCount}
            onNext={this._handleNext}
            onPrev={this._handlePrev}
          />
          <CommentList campaignId={campaignId} comments={comments} />
        </CommentsContent>
      </Container>
    );
  }
}

CommentsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CommentsPage);
