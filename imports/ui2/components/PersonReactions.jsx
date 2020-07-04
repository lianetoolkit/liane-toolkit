import React, { Component } from "react";
import styled from "styled-components";
import { get } from "lodash";

import Reaction from "./Reaction.jsx";

const reactions = [
  "like",
  "care",
  "thankful",
  "love",
  "wow",
  "haha",
  "sad",
  "angry",
];

const Container = styled.ul`
  display: flex;
  width: 100%;
  margin: 0 0 1rem;
  justify-content: center;
  align-items: center;
  padding: 0;
  list-style: none;
  li {
    margin: 0;
    padding: 0;
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    font-weight: 600;
    font-size: 1.1em;
    img {
      margin-right: 0.75rem;
    }
  }
`;

export default class PersonReactions extends Component {
  reactionVal(reaction) {
    const { person } = this.props;
    return get(person, `counts.reactions.${reaction}`) || 0;
  }
  renderReaction(reaction) {
    const val = this.reactionVal(reaction);
    if (val) {
      return (
        <li>
          <Reaction reaction={reaction} /> {val}
        </li>
      );
    }
    return null;
  }
  render() {
    return (
      <Container className="person-reactions-count">
        {reactions.map((reaction) => this.renderReaction(reaction))}
      </Container>
    );
  }
}
