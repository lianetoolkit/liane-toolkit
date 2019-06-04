import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

const Container = styled.article`
  header {
    padding: 0.5rem 1rem;
    color: #666;
    h3 {
      margin: 0 0 0.5rem 0;
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
      }
    }
  }
  .comment-message {
    background: #f0f0f0;
    font-size: 0.9em;
    padding: 1rem;
    position: relative;
    margin: 0 1rem 1rem 1rem;
    border-radius: 7px;
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
`;

export default class Comment extends Component {
  render() {
    const { comment } = this.props;
    if (comment) {
      return (
        <Container>
          <header>
            <h3>
              <span className="name">{comment.person.name}</span> comentou em um
              post{" "}
              <span className="date">
                {moment(comment.created_time).fromNow()}
              </span>
            </h3>
          </header>
          <section className="comment-message">
            <p>{comment.message}</p>
          </section>
        </Container>
      );
    }
    return null;
  }
}
