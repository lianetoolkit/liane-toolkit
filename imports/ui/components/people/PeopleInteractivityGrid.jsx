import React from "react";
import styled from "styled-components";
import { Grid, Icon } from "semantic-ui-react";
import Reaction from "/imports/ui/components/entries/Reaction.jsx";

const reactions = ["like", "love", "wow", "haha", "sad", "angry"];

const Wrapper = styled.div`
  opacity: 0.75;
  .grid {
    text-align: center;
    color: #999;
    img,
    .icon {
      display: inline-block;
      float: left;
      margin-right: 0.5rem;
      color: #333;
    }
  }
`;

export default class PeopleInteractivityGrid extends React.Component {
  render() {
    const { person, facebookId } = this.props;
    if (person && person.counts && facebookId) {
      return (
        <Wrapper>
          <Grid
            className="interactivity"
            widths="equal"
            columns={7}
            verticalAlign="middle"
          >
            <Grid.Row>
              <Grid.Column>
                <Icon name="comment" />
                {person.counts[facebookId] ? (
                  <span>{person.counts[facebookId].comments || 0}</span>
                ) : (
                  <span>0</span>
                )}
              </Grid.Column>
              {reactions.map(reaction => (
                <Grid.Column key={reaction}>
                  <Reaction size="tiny" reaction={reaction} />
                  {person.counts[facebookId] &&
                  person.counts[facebookId].reactions ? (
                    <span>{person.counts[facebookId].reactions[reaction]}</span>
                  ) : (
                    <span>0</span>
                  )}
                </Grid.Column>
              ))}
            </Grid.Row>
          </Grid>
        </Wrapper>
      );
    }
    return null;
  }
}
