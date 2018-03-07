import React from "react";
import { Grid, Icon } from "semantic-ui-react";
import styled from "styled-components";
import moment from "moment";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";
import Entry from "/imports/ui/components/entries/Entry.jsx";
import Comment from "/imports/ui/components/entries/Comment.jsx";

const Wrapper = styled.div`
  margin: 0 0 2rem;
  .entry {
    border: 1px solid #eee;
    opacity: 0.5;
    padding: 1rem 1rem 0;
    background: #fdfdfd;
  }
  &:hover {
    .entry {
      opacity: 1;
    }
  }
`;

const ReactionWrapper = styled.div`
  display: block;
  margin: 0 auto;
  text-align: center;
  width: 46px;
  .ban.icon {
    color: #ddd;
    font-size: 46px;
    line-height: 1;
    margin: 0;
    padding: 0;
  }
`;

const Interactivity = styled.div`
  padding: 1rem;
  border: 1px solid #eee;
  h4 {
    font-size: .8em;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.1rem;
    font-weight: 200;
  }
`;

export default class PeopleInteractivityItem extends React.Component {
  render() {
    const { entry, comments, like, ...props } = this.props;
    return (
      <Wrapper>
        <div className="entry">
          <Entry entry={entry} />
        </div>
        <Interactivity>
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column width={2}>
                <h4>Reaction</h4>
                {like ? (
                  <ReactionWrapper>
                    <Reaction reaction={like} size="large" />
                  </ReactionWrapper>
                ) : (
                  <ReactionWrapper>
                    <Icon name="ban" />
                  </ReactionWrapper>
                )}
              </Grid.Column>
              <Grid.Column width={14}>
                <div className="comments">
                  <h4>Comments</h4>
                  {comments && comments.length ? (
                    <div>
                      {comments.map(comment => (
                        <Comment key={comment._id} comment={comment} />
                      ))}
                    </div>
                  ) : (
                    <p>None</p>
                  )}
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Interactivity>
      </Wrapper>
    );
  }
}
