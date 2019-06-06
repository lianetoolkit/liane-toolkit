import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import moment from "moment";
import { debounce } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import PageFilters from "../components/PageFilters.jsx";
import PagePaging from "../components/PagePaging.jsx";
import Reaction from "../components/Reaction.jsx";
import Button from "../components/Button.jsx";
import Comment from "../components/Comment.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  background: #fff;
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
`;

const CommentContainer = styled.article`
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
  display: flex;
  justify-content: center;
  .comment-content {
    flex: 1 1 100%;
    padding: 1rem;
  }
  .comment-reply,
  .comment-actions,
  .comment-resolve {
    flex: 0 0 auto;
    padding: 1rem;
    border-left: 1px solid #eee;
    ${"" /* background: #f7f7f7;
    border-left: 1px solid #eee; */}
  }
  .comment-reply {
    .reaction-filter {
      margin-bottom: 0.5rem;
    }
    .button-group {
      font-size: 0.8em;
    }
  }
  .action-icons {
    display: flex;
    a {
      width: 40px;
      height: 40px;
      display: flex;
      margin: 0 0.25rem;
      justify-content: center;
      align-items: center;
      color: #63c;
      background-color: rgba(102, 51, 204, 0);
      border: 1px solid rgba(102, 51, 204, 0.25);
      border-radius: 100%;
      transition: all 0.1s linear;
      &:hover {
        background-color: #63c;
        color: #fff;
      }
      &.active {
        background-color: #63c;
        color: #fff;
        &:hover {
          opacity: 0.5;
        }
      }
    }
  }
  .comment-resolve {
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 102, 51, 0.1);
    border-left: 1px solid #eee;
    a {
      width: 40px;
      height: 40px;
      display: flex;
      margin: 0 0.5rem;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      color: #006633;
      &:hover,
      &:focus {
        background: #006633;
        color: #fff;
      }
    }
  }
  .action-label {
    font-size: 0.8em;
    color: #666;
  }
`;

export default class CommentsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCount: false,
      count: 0
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
  hasCategory = (comment, category) => {
    return comment.categories && comment.categories.indexOf(category) != -1;
  };
  _handleCategoryClick = (comment, category) => () => {
    const { campaignId } = this.props;
    let categories = (comment.categories || []).slice(0);
    if (!this.hasCategory(comment, category)) {
      categories.push(category);
    } else {
      categories = categories.filter(cat => cat != category);
    }
    Meteor.call(
      "comments.updateCategories",
      {
        campaignId,
        commentId: comment._id,
        categories
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          console.log(res);
        }
      }
    );
  };
  _handleResolveClick = comment => () => {
    const { campaignId } = this.props;
    if (
      confirm("Tem certeza que deseja marcar este comentário como resolvido?")
    ) {
      Meteor.call(
        "comments.resolve",
        { campaignId, commentId: comment._id },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            console.log(res);
          }
        }
      );
    }
  };
  _handleChange = ({ target }) => {
    const value = target.value || null;
    FlowRouter.setQueryParams({ [target.name]: value });
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
    const { comments, limit, page } = this.props;
    const { loadingCount, count } = this.state;
    return (
      <>
        <Page.Nav full plain>
          <PageFilters>
            <div className="filters">
              <form onSubmit={ev => ev.preventDefault()}>
                <input
                  className="main-input"
                  type="text"
                  placeholder="Buscar por texto"
                  name="q"
                  onChange={this._handleChange}
                  // value={query.q}
                />
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
          {comments.length ? (
            <div className="comments">
              {comments.map((comment, i) => (
                <CommentContainer key={comment._id}>
                  <div className="comment-content">
                    <Comment comment={comment} />
                  </div>
                  <div className="comment-reply">
                    <p className="action-label">Reagir e responder</p>
                    <Reaction.Filter target={comment._id} />
                    <Button.Group>
                      <Button>Responder</Button>
                      <Button>Inbox</Button>
                    </Button.Group>
                  </div>
                  <div className="comment-actions">
                    <p className="action-label">Classificar</p>
                    <div className="action-icons">
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar como pergunta"
                        className={
                          this.hasCategory(comment, "question") ? "active" : ""
                        }
                        onClick={this._handleCategoryClick(comment, "question")}
                      >
                        <FontAwesomeIcon icon="question" />
                      </a>
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar como declaração de voto"
                        className={
                          this.hasCategory(comment, "vote") ? "active" : ""
                        }
                        onClick={this._handleCategoryClick(comment, "vote")}
                      >
                        <FontAwesomeIcon icon="thumbs-up" />
                      </a>
                      <a
                        href="javascript:void(0);"
                        data-tip="Marcar pessoa como troll"
                      >
                        <FontAwesomeIcon icon="ban" />
                      </a>
                    </div>
                  </div>
                  <div className="comment-resolve">
                    <a
                      href="javascript:void(0);"
                      data-tip="Marcar com resolvido"
                      onClick={this._handleResolveClick(comment)}
                    >
                      <FontAwesomeIcon icon="check" />
                    </a>
                  </div>
                </CommentContainer>
              ))}
              <ReactTooltip effect="solid" />
            </div>
          ) : null}
        </CommentsContent>
      </>
    );
  }
}
