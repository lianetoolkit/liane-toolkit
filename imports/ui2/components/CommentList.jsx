import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { userCan } from "/imports/ui2/utils/permissions";

import { alertStore } from "../containers/Alerts.jsx";

import Comment from "../components/Comment.jsx";
import Reaction from "../components/Reaction.jsx";

const messages = defineMessages({
  personNotFound: {
    id: "app.person_not_found",
    defaultMessage: "Person not found",
  },
  commentResolved: {
    id: "app.comment.resolved",
    defaultMessage: "resolved",
  },
  commentUnresolved: {
    id: "app.comment.unresolved",
    defaultMessage: "unresolved",
  },
  confirmResolution: {
    id: "app.comment.confirm_resolution",
    defaultMessage:
      "Are you sure you'd like to mark this comment as {resolution}",
  },
  tagQuestion: {
    id: "app.comment.tag_as.question",
    defaultMessage: "Mark as question",
  },
  tagVote: {
    id: "app.comment.tag_as.vote",
    defaultMessage: "Mark as vote declaration",
  },
  tagTroll: {
    id: "app.comment.tag_as.troll",
    defaultMessage: "Mark this person as troll",
  },
  tagAs: {
    id: "app.comment.tag_as",
    defaultMessage: "Mark as",
  },
});

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
  .comment-source,
  .comment-resolve {
    flex: 0 0 auto;
    padding: 1rem;
    border-left: 1px solid #eee;
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
      color: #306;
      background-color: rgba(51, 0, 102, 0);
      border: 1px solid rgba(51, 0, 102, 0.25);
      border-radius: 100%;
      transition: all 0.1s linear;
      &:hover {
        background-color: rgba(51, 0, 102, 0.5);
        color: #fff;
      }
      &.active {
        background-color: #306;
        color: #fff;
        &:hover {
          background-color: rgba(51, 0, 102, 0.75);
        }
      }
      &.troll {
        color: #c00;
        background-color: rgba(204, 51, 51, 0);
        border: 1px solid rgba(204, 51, 51, 0.25);
        &:hover {
          background-color: rgba(204, 51, 51, 0.5);
          color: #fff;
        }
        &.active {
          background-color: #ca3333;
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
    background: rgba(245, 145, 30, 0.1);
    border-left: 1px solid #eee;
    a {
      width: 40px;
      height: 40px;
      display: flex;
      margin: 0 0.5rem;
      justify-content: center;
      align-items: center;
      border-radius: 100%;
      color: #f5911e;
      &:hover,
      &:focus {
        background: #f5911e;
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

class CommentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      personMeta: {},
    };
  }
  hasCategory = (comment, category) => {
    return comment.categories && comment.categories.indexOf(category) != -1;
  };
  isTroll = (comment) => {
    const { personMeta } = this.state;
    if (
      personMeta[comment.personId] &&
      personMeta[comment.personId].hasOwnProperty("troll")
    ) {
      return personMeta[comment.personId].troll;
    } else if (comment.person) {
      return comment.person.campaignMeta && comment.person.campaignMeta.troll;
    }
    return false;
  };
  _handleCategoryClick = (comment, category) => () => {
    const { campaignId } = this.props;
    let categories = (comment.categories || []).slice(0);
    if (!this.hasCategory(comment, category)) {
      categories.push(category);
    } else {
      categories = categories.filter((cat) => cat != category);
    }
    Meteor.call(
      "comments.updateCategories",
      {
        campaignId,
        commentId: comment._id,
        categories,
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        }
      }
    );
  };
  _handleTrollClick = (comment) => () => {
    const { intl } = this.props;
    const { personMeta } = this.state;
    const isTroll = this.isTroll(comment);
    if (!comment.person) {
      alertStore.add(intl.formatMessage(messages.person_not_found), "error");
      return;
    }
    Meteor.call(
      "facebook.people.updatePersonMeta",
      {
        personId: comment.person._id,
        metaKey: "troll",
        metaValue: !isTroll,
      },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            personMeta: {
              ...personMeta,
              [comment.personId]: { troll: !isTroll },
            },
          });
        }
      }
    );
  };
  _handleReactionChange = (commentId) => (reaction) => {
    const { campaignId } = this.props;
    Meteor.call(
      "comments.react",
      { campaignId, commentId, reaction },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Updated", "success");
        }
      }
    );
  };
  _handleResolveClick = (comment) => () => {
    const { intl, campaignId } = this.props;
    const resolve = !comment.resolved;
    const label = resolve
      ? intl.formatMessage(messages.commentResolved)
      : intl.formatMessage(messages.commentUnresolved);
    if (
      confirm(
        intl.formatMessage(messages.confirmResolution, { resolution: label })
      )
    ) {
      Meteor.call(
        "comments.resolve",
        { campaignId, commentId: comment._id, resolve },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Updated", "success");
          }
        }
      );
    }
  };
  _getSourceIcon = (comment) => {
    switch (comment.source) {
      case "instagram":
        return ["fab", "instagram"];
      default:
        return ["fab", "facebook-square"];
    }
  };
  render() {
    const { intl, comments } = this.props;
    if (!comments || !comments.length) return null;
    return (
      <div className="comments">
        {comments.map((comment, i) => (
          <CommentContainer key={comment._id}>
            <div className="comment-content">
              <Comment comment={comment} actions={true} />
            </div>
            {userCan("categorize", "comments") ? (
              <>
                <div className="comment-actions">
                  <p className="action-label">
                    <FormattedMessage
                      id="app.comment.actions_title"
                      defaultMessage="Actions"
                    />
                  </p>
                  <div className="action-icons">
                    <a
                      href="javascript:void(0);"
                      data-tip={intl.formatMessage(messages.tagQuestion)}
                      className={
                        this.hasCategory(comment, "question") ? "active" : ""
                      }
                      onClick={this._handleCategoryClick(comment, "question")}
                    >
                      <FontAwesomeIcon icon="question" />
                    </a>
                    <a
                      href="javascript:void(0);"
                      data-tip={intl.formatMessage(messages.tagVote)}
                      className={
                        this.hasCategory(comment, "vote") ? "active" : ""
                      }
                      onClick={this._handleCategoryClick(comment, "vote")}
                    >
                      <FontAwesomeIcon icon="thumbs-up" />
                    </a>
                    <a
                      href="javascript:void(0);"
                      data-tip={intl.formatMessage(messages.tagTroll)}
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
                      intl.formatMessage(messages.tagAs) +
                      " " +
                      (comment.resolved
                        ? intl.formatMessage(messages.commentUnresolved)
                        : intl.formatMessage(messages.commentResolved))
                    }
                    onClick={this._handleResolveClick(comment)}
                  >
                    <FontAwesomeIcon
                      icon={comment.resolved ? "undo-alt" : "check"}
                    />
                  </a>
                </div>
              </>
            ) : null}
          </CommentContainer>
        ))}
        <ReactTooltip effect="solid" />
      </div>
    );
  }
}

CommentList.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CommentList);
