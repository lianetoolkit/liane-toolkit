import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import { modalStore } from "../containers/Modal.jsx";

import Button from "./Button.jsx";
import Reaction from "./Reaction.jsx";
import Reply from "./Reply.jsx";

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
      .name {
        color: #333;
        font-weight: 600;
        font-size: 1.1em;
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
      left: 1rem;
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
    ${"" /* margin-top: 1rem; */}
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
    const { total } = this.props;
    if (!total || total == 0) {
      return "Nenhum comentário";
    } else if (total == 1) {
      return "1 comentário";
    } else {
      return `${total} comentários`;
    }
  };
  render() {
    return <CountContainer>{this.label()}</CountContainer>;
  }
}

export default class Comment extends Component {
  static Count = Count;
  action = () => {
    const { comment } = this.props;
    const url = this.getCommentUrl();
    if (comment.parent) {
      const parentUrl = this.getParentUrl();
      return (
        <>
          <a href={url} target="_blank">
            respondeu
          </a>{" "}
          um{" "}
          <a href={parentUrl} target="_blank">
            comentário
          </a>
        </>
      );
    } else {
      const postUrl = this.getPostUrl();
      return (
        <>
          <a href={url} target="_blank">
            comentou
          </a>{" "}
          uma{" "}
          <a href={postUrl} target="_blank">
            publicação
          </a>
        </>
      );
    }
  };
  getCommentUrl = () => {
    const { comment } = this.props;
    const id = comment.facebookAccountId;
    const story_fbid = comment._id.split("_")[0];
    const comment_id = comment._id.split("_")[1];
    return this.getFBUrl({ id, story_fbid, comment_id });
  };
  getParentUrl = () => {
    const { comment } = this.props;
    const id = comment.facebookAccountId;
    const story_fbid = comment.parentId.split("_")[0];
    const comment_id = comment.parentId.split("_")[1];
    return this.getFBUrl({ id, story_fbid, comment_id });
  };
  getPostUrl = () => {
    const { comment } = this.props;
    const id = comment.facebookAccountId;
    const story_fbid = comment._id.split("_")[0];
    return this.getFBUrl({ id, story_fbid });
  };
  getFBUrl = params => {
    const encoded = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join("&");
    return `https://www.facebook.com/permalink.php?${encoded}`;
  };
  _handleReplyClick = ev => {
    const { comment } = this.props;
    ev.preventDefault();
    modalStore.setTitle(`Respondendo ${comment.person.name}`);
    modalStore.set(<Reply comment={comment} defaultSendAs="comment" />);
  };
  render() {
    const { comment, actions } = this.props;
    if (comment) {
      return (
        <Container>
          <header>
            <h3>
              <span className="name">{comment.person.name}</span>{" "}
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
                  <p className="label">Você respondeu</p>
                  {comment.adminReplies.map(reply => (
                    <p className="reply" key={reply._id}>
                      {reply.message}
                    </p>
                  ))}
                </>
              ) : null}
              {actions ? (
                <div className="comment-fb-actions">
                  {/* <p className="label">Responder</p> */}
                  <Button onClick={this._handleReplyClick}>Responder</Button>
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
