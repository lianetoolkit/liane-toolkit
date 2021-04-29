import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import styled from "styled-components";
import moment from "moment";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { userCan } from "/imports/ui2/utils/permissions";

import { modalStore } from "../containers/Modal.jsx";

import Button from "./Button.jsx";
import Reaction from "./Reaction.jsx";
import Reply from "./Reply.jsx";

import PersonNamePopup from "./PersonNamePopup.jsx";

const messages = defineMessages({
  countNoComments: {
    id: "app.comments.counts.no_comments",
    defaultMessage: "No comments",
  },
  countOneComment: {
    id: "app.comments.counts.one_comment",
    defaultMessage: "1 comment",
  },
  countAnyComments: {
    id: "app.comments.counts.any_comments",
    defaultMessage: "{count} comments",
  },
  replyUnknownPerson: {
    id: "app.reply.unknown_person",
    defaultMessage: "unknown person",
  },
  replyTitle: {
    id: "app.reply.title",
    defaultMessage: "Replying {name}",
  },
  commentUnknown: {
    id: "app.comment.header.unknown_name",
    defaultMessage: "Unknown person",
  },
});

const Container = styled.article`
  header {
    color: #999;
    a {
      color: #bbb;
      &:hover,
      &:active,
      &:focus {
        color: #333;
      }
    }
    h3 {
      margin: 0 0 1rem;
      font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 1em;
      .icon {
        font-size: 1.2em;
        color: #3b5998;
        margin-right: 0.5rem;
        &.instagram {
          color: #dd2a7b;
        }
      }
      .name {
        color: #333;
        font-weight: 600;
        font-size: 1.1em;
        a {
          color: #333;
          &:hover {
            color: #000;
          }
        }
      }
      .date {
        color: #ccc;
        font-size: 0.9em;
        margin-left: 0.5rem;
        white-space: nowrap;
      }
    }
  }
  .messaging {
    display: flex;
  }
  .comment-message {
    flex: 2 1 0;
    background: #f0f0f0;
    padding: 0.8rem 1rem 1rem;
    position: relative;
    margin: 0 1rem 0 0;
    border-radius: 7px;
    display: inline-block;
    position: relative;
    &:before {
      content: "";
      background: #f0f0f0;
      position: absolute;
      width: 10px;
      height: 10px;
      left: 2rem;
      top: -5px;
      transform: rotate(45deg);
    }
    p {
      margin: 0;
    }
    .comment-meta {
      float: right;
      position: absolute;
      bottom: -0.6rem;
      right: 0;
      margin-right: 0.5rem;
      display: flex;
      align-items: center;
      > * {
        margin-left: 0.15rem;
      }
    }
  }
  .comment-admin-replies {
    flex: 1 1 0;
    font-size: 0.8em;
    .label {
      font-size: 0.9em;
      color: #999;
      margin: 0 0 0.5rem;
    }
    p.reply {
      padding: 0.25rem 0.5rem;
      background: #333;
      color: #f0f0f0;
      border-radius: 7px;
      display: table;
      position: relative;
      margin: 0 0 0.5rem;
      &:before {
        content: "";
        background: #333;
        position: absolute;
        width: 5px;
        height: 5px;
        left: -2.5px;
        top: 10px;
        transform: rotate(45deg);
      }
    }
  }
  .comment-fb-actions {
    .button {
      margin: 0;
      display: block;
    }
  }
`;

const CountContainer = styled.div`
  font-size: 0.8em;
  background: #fff;
  border: 1px solid #e7e7e7;
  padding: 0.15rem 0.35rem;
  border-radius: 7px;
  display: flex;
  align-items: center;
  color: #999;
`;

class Count extends Component {
  label = () => {
    const { intl, total } = this.props;
    if (!total || total == 0) {
      return intl.formatMessage(messages.countNoComments);
    } else if (total == 1) {
      return intl.formatMessage(messages.countOneComment);
    } else {
      return intl.formatMessage(messages.countAnyComments, { count: total });
    }
  };
  render() {
    return <CountContainer>{this.label()}</CountContainer>;
  }
}

Count.propTypes = {
  intl: intlShape.isRequired,
};

const CountIntl = injectIntl(Count);

export const getFBUrl = (params) => {
  const encoded = Object.keys(params)
    .map((key) => `${key}=${encodeURIComponent(params[key])}`)
    .join("&");
  return `https://www.facebook.com/permalink.php?${encoded}`;
};

export const getFBCommentUrl = (comment) => {
  const id = comment.facebookAccountId;
  const story_fbid = comment._id.split("_")[0];
  const comment_id = comment._id.split("_")[1];
  return getFBUrl({
    id,
    story_fbid,
    comment_id,
    comment_tracking: '{"tn":"R"}',
  });
};

class Comment extends Component {
  static Count = CountIntl;
  action = () => {
    const { comment } = this.props;
    const url = this.getCommentUrl();
    if (comment.parent) {
      const parentUrl = this.getParentUrl();
      return (
        <FormattedHTMLMessage
          id="app.comment.header.reply_header"
          defaultMessage="<a href='{url}' target='_blank'>replied</a> a <a href='{parent_url}' target='_blank'>comment</a>"
          values={{ url, parent_url: parentUrl }}
        />
      );
    } else {
      const postUrl = this.getPostUrl();
      return (
        <FormattedHTMLMessage
          id="app.comment.header.comment_header"
          defaultMessage="<a href='{url}' target='_blank'>commented</a> on a <a href='{post_url}' target='_blank'>post</a>"
          values={{ url, post_url: postUrl }}
        />
      );
    }
  };
  getCommentUrl = () => {
    const { comment } = this.props;
    if (comment.source == "instagram") {
      let url = `${comment.entry.source_data.permalink}c/`;
      if (comment.parentId) {
        url += `${comment.parentId}/r/`;
      }
      url += comment._id;
      return url;
    } else {
      return getFBCommentUrl(comment);
    }
  };
  getParentUrl = () => {
    const { comment } = this.props;
    if (comment.source == "instagram") {
      return `${comment.entry.source_data.permalink}c/${comment.parentId}`;
    } else {
      const id = comment.facebookAccountId;
      const story_fbid = comment.parentId.split("_")[0];
      const comment_id = comment.parentId.split("_")[1];
      return getFBUrl({ id, story_fbid, comment_id });
    }
  };
  getPostUrl = () => {
    const { comment } = this.props;
    if (comment.source == "instagram") {
      return comment.entry.source_data.permalink;
    } else {
      const id = comment.facebookAccountId;
      const story_fbid = comment._id.split("_")[0];
      return getFBUrl({ id, story_fbid });
    }
  };
  _handleReplyClick = (ev) => {
    const { intl, comment } = this.props;
    ev.preventDefault();
    const name = comment.person
      ? comment.person.name
      : intl.formatMessage(messages.replyUnknownPerson);
    const title = intl.formatMessage(messages.replyTitle, { name });
    modalStore.setTitle(title);
    modalStore.set(<Reply comment={comment} defaultSendAs="comment" />);
  };

  _getSourceIcon = () => {
    const { comment } = this.props;
    switch (comment.source) {
      case "instagram":
        return ["fab", "instagram"];
      default:
        return ["fab", "facebook-square"];
    }
  };
  render() {
    const { intl, comment, actions } = this.props;
    if (comment) {
      return (
        <Container>
          <header>
            <h3>
              <span className={`icon ${comment.source}`}>
                <FontAwesomeIcon icon={this._getSourceIcon(comment)} />
              </span>
              {comment.person ? (
                <PersonNamePopup
                  name={comment.person.name}
                  personId={comment.person._id}
                />
              ) : (
                intl.formatMessage(messages.commentUnknown)
              )}{" "}
              {this.action()}{" "}
              <span className="date">
                {moment(comment.created_time).fromNow()}
              </span>
            </h3>
          </header>
          <div className="messaging">
            <section className="comment-message">
              <p>{comment.message}</p>
              <div className="comment-meta">
                <Reaction.Count
                  counts={comment.reaction_count}
                  total={comment.reaction_count.reaction}
                  target={comment._id}
                />
                <Comment.Count total={comment.comment_count} />
              </div>
            </section>
            <section className="comment-admin-replies">
              {comment.adminReplies && comment.adminReplies.length ? (
                <>
                  <p className="label">
                    <FormattedMessage
                      id="app.coment.you_replied"
                      defaultMessage="You replied"
                    />
                  </p>
                  {comment.adminReplies.map((reply) => (
                    <p className="reply" key={reply._id}>
                      {reply.message}
                    </p>
                  ))}
                </>
              ) : null}
              {actions && userCan("edit", "comments") ? (
                <div className="comment-fb-actions">
                  <Button
                    onClick={this._handleReplyClick}
                    disabled={
                      !comment.can_comment && !comment.can_reply_privately
                    }
                  >
                    <FormattedMessage
                      id="app.comment.reply_button"
                      defaultMessage="Reply"
                    />
                  </Button>
                </div>
              ) : null}
            </section>
          </div>
        </Container>
      );
    }
    return null;
  }
}

Comment.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Comment);
