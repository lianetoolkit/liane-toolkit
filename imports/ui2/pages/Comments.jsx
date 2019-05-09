import React, { Component } from "react";
import styled from "styled-components";
import moment from "moment";

import Page from "../components/Page.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  background: #fff;
`;

const Comment = styled.article`
  border-bottom: 1px solid #ddd;
  font-size: 0.9em;
  header {
    padding: 0.5rem 1rem;
    color: #666;
    h3 {
      margin: 0.5rem 0;
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
    background: #f7f7f7;
    font-size: 0.9em;
    padding: 1rem;
    position: relative;
    margin: 0 1rem 1rem 1rem;
    &:before {
      content: "";
      background: #f7f7f7;
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

export default class CommentsPage extends Component {
  render() {
    const { comments } = this.props;
    return (
      <>
        <Page.Nav full plain />
        <Container>
          {comments.length ? (
            <div>
              {comments.map(comment => (
                <Comment key={comment._id}>
                  <header>
                    <h3>
                      <span className="name">{comment.person.name}</span>{" "}
                      comentou em um post{" "}
                      <span className="date">
                        {moment(comment.created_time).fromNow()}
                      </span>
                    </h3>
                  </header>
                  <div className="comment-content">
                    <section className="comment-message">
                      <p>{comment.message}</p>
                    </section>
                  </div>
                </Comment>
              ))}
            </div>
          ) : null}
        </Container>
      </>
    );
  }
}
