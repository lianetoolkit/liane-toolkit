import React, { Component } from "react";
import { ClientStorage } from "meteor/ostrio:cstorage";
import styled from "styled-components";
import moment from "moment";

const Container = styled.article`
  header {
    color: #666;
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
        color: #999;
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
    background: #f0f0f0;
    padding: 0.5rem 1rem;
    position: relative;
    margin: 0 1rem 0 0;
    border-radius: 7px;
    display: inline-block;
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
  }
  .comment-admin-replies {
    font-size: 0.9em;
    margin-top: 1rem;
    .label {
      font-size: 0.8em;
      color: #999;
      margin: 0 0 0.5rem;
    }
    p.reply {
      padding: 0.25rem 0.5rem;
      background: #333;
      color: #fff;
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
`;

export default class Comment extends Component {
  action = () => {
    const { comment } = this.props;
    if (comment.parent) {
      return "respondeu um comentário";
    } else {
      return "comentou em um post";
    }
  };
  render() {
    const { comment } = this.props;
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
            </section>
            {comment.adminReplies && comment.adminReplies.length ? (
              <section className="comment-admin-replies">
                <p className="label">Você respondeu</p>
                {comment.adminReplies.map(reply => (
                  <p className="reply">{reply.message}</p>
                ))}
              </section>
            ) : null}
          </div>
        </Container>
      );
    }
    return null;
  }
}
