import React from "react";
import { Grid } from "semantic-ui-react";
import styled from "styled-components";
import moment from "moment";

const Wrapper = styled.div`
  background: #f7f7f7;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  margin: 0 0 1rem;
  p.comment {
    margin: 0 0 .5rem;
    word-wrap: break-word;
  }
  .comment-date {
    font-size: .8em;
    color: #999;
    margin: 0;
  }
`;

export default class Comment extends React.Component {
  render() {
    const { comment } = this.props;
    return (
      <Wrapper>
        <p className="comment">{comment.message}</p>
        <p className="comment-date">{moment(comment.created_time).fromNow()}</p>
      </Wrapper>
    );
  }
}
