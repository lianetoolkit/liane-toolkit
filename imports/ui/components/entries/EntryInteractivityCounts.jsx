import React from "react";
import Reaction from "./Reaction.jsx";
import styled from "styled-components";
import { Icon } from "semantic-ui-react";

const Wrapper = styled.p`
  color: #999;
  font-size: .8em;
  span.item {
    display: inline-block;
    margin: 0 .5rem 0 0;
    .icon {
      display: inline-block;
      margin: 0 .25rem 0 0;
    }
  }
`

export default class EntryInteractivityCounts extends React.Component {
  _keys() {
    const { entry } = this.props;
    return [
      "like",
      "love",
      "wow",
      "haha",
      "sad",
      "angry",
      "comment",
      "share"
    ];
  }
  render() {
    const { entry } = this.props;
    return (
      <Wrapper>
        {this._keys().map(key => (
          <span key={key}>
            {entry.counts[key] ? (
              <span className="item">
                {key == "share" || key == "comment" ? (
                  <Icon className="icon" name={key} size="small" />
                ) : (
                  <Reaction className="icon" reaction={key} size="tiny" />
                )}
                {entry.counts[key]}
              </span>
            ) : null}
          </span>
        ))}
      </Wrapper>
    )
  }
}
