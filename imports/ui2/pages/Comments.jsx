import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import moment from "moment";
import { debounce } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Page from "../components/Page.jsx";
import PageFilters from "../components/PageFilters.jsx";
import PagePaging from "../components/PagePaging.jsx";
import Reaction from "../components/Reaction.jsx";
import Button from "../components/Button.jsx";
import Comment from "../components/Comment.jsx";

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
    flex-direction: row;
    justify-content: center;
    align-items: center;
    a {
      width: 30px;
      height: 30px;
      font-size: 0.8em;
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
        background-color: rgba(102, 51, 204, 0.5);
        color: #fff;
      }
      &.active {
        background-color: #63c;
        color: #fff;
        &:hover {
          background-color: rgba(102, 51, 204, 0.75);
        }
      }
      &.troll {
        color: #c00;
        background-color: rgba(204, 0, 0, 0);
        border: 1px solid rgba(204, 0, 0, 0.25);
        &:hover {
          background-color: rgba(204, 0, 0, 0.5);
          color: #fff;
        }
        &.active {
          background-color: #c00;
          color: #fff;
          &:hover {
            background-color: rgba(204, 0, 0, 0.75);
          }
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
    &.resolved {
      background-color: #f7f7f7;
      a {
        color: #999;
        &:hover,
        &:focus {
          background: #333;
          color: #fff;
        }
      }
    }
  }
  .action-label {
    font-size: 0.8em;
    color: #999;
  }
`;

export default class CommentsPage extends Component {
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
  hasCategory = (comment, category) => {
    return comment.categories && comment.categories.indexOf(category) != -1;
  };
  isTroll = comment => {
    const { personMeta } = this.state;
    if (
      personMeta[comment.personId] &&
      personMeta[comment.personId].hasOwnProperty("troll")
    ) {
      return personMeta[comment.personId].troll;
    } else {
      return comment.person.campaignMeta && comment.person.campaignMeta.troll;
    }
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
        }
      }
    );
  };
  _handleTrollClick = comment => () => {
    const { personMeta } = this.state;
    const isTroll = this.isTroll(comment);
    Meteor.call(
      "facebook.people.updatePersonMeta",
      {
        personId: comment.person._id,
        metaKey: "troll",
        metaValue: !isTroll
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            personMeta: {
              ...personMeta,
              [comment.personId]: { troll: !isTroll }
            }
          });
        }
      }
    );
  };
  _handleReactionChange = commentId => reaction => {
    const { campaignId } = this.props;
    console.log(reaction);
    Meteor.call(
      "comments.react",
      { campaignId, commentId, reaction },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Sucesso", "success");
        }
      }
    );
  };
  _handleResolveClick = comment => () => {
    const { campaignId } = this.props;
    const resolve = !comment.resolved;
    const label = resolve ? "resolvido" : "não resolvido";
    if (
      confirm(`Tem certeza que deseja marcar este comentário como ${label}?`)
    ) {
      Meteor.call(
        "comments.resolve",
        { campaignId, commentId: comment._id, resolve },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add(`Marcado como ${label}`, "success");
          }
        }
      );
    }
  };
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
    const { comments, limit, page } = this.props;
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
                    Não resolvidas
                  </Button>
                  <Button
                    onClick={this._handleQueryResolveClick(true)}
                    active={this.isQueryingResolved()}
                  >
                    Resolvidas
                  </Button>
                </Button.Group>
                <input
                  className="main-input"
                  type="text"
                  placeholder="Buscar por texto"
                  name="q"
                  onChange={this._handleChange}
                  // value={query.q}
                />
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
                    Todos os comentários
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
                    Marcados como pergunta
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
                    Declarações de voto
                  </label>
                </PageFilters.Category>
                <label>
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="hideReplies"
                    checked={this.isQueryingHideReplies()}
                    disabled={this.isQueryingUnreplied()}
                  />
                  Ocultar respostas à comentários
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="unreplied"
                    checked={this.isQueryingUnreplied()}
                  />
                  Comentários sem respostas da página
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="privateReply"
                    checked={this.isQueryingPrivateReply()}
                  />
                  Comentários que podem receber mensagem privada
                </label>
                <label>
                  <input
                    type="checkbox"
                    onChange={this._handleCheckboxChange}
                    name="mention"
                    checked={this.isQueryingMention()}
                  />
                  Comentários com menções
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
          {comments.length ? (
            <div className="comments">
              {comments.map((comment, i) => (
                <CommentContainer key={comment._id}>
                  <div className="comment-content">
                    <Comment comment={comment} actions={true} />
                  </div>
                  {/* <div className="comment-reply">
                    <p className="action-label">Reagir e responder</p>
                    <Reaction.Filter
                      target={comment._id}
                      onChange={this._handleReactionChange(comment._id)}
                    />
                    <Button.Group>
                      <Button>Responder</Button>
                      <Button>Inbox</Button>
                    </Button.Group>
                  </div> */}
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
                        className={
                          this.isTroll(comment) ? "active troll" : "troll"
                        }
                        onClick={this._handleTrollClick(comment)}
                      >
                        <FontAwesomeIcon icon="ban" />
                      </a>
                    </div>
                  </div>
                  <div
                    className={
                      "comment-resolve " + (comment.resolved ? "resolved" : "")
                    }
                  >
                    <a
                      href="javascript:void(0);"
                      data-tip={
                        comment.resolved
                          ? "Marcar como não resolvido"
                          : "Marcar como resolvido"
                      }
                      onClick={this._handleResolveClick(comment)}
                    >
                      <FontAwesomeIcon
                        icon={comment.resolved ? "undo-alt" : "check"}
                      />
                    </a>
                  </div>
                </CommentContainer>
              ))}
              <ReactTooltip effect="solid" />
            </div>
          ) : null}
        </CommentsContent>
      </Container>
    );
  }
}
