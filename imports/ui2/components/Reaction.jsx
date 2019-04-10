import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import PopupLabel from "./PopupLabel.jsx";

const sizes = {
  tiny: 16,
  small: 24,
  medium: 32,
  large: 46,
  huge: 64
};

const imagePaths = {
  like: "/images/reactions/like.png",
  love: "/images/reactions/love.png",
  haha: "/images/reactions/haha.png",
  wow: "/images/reactions/wow.png",
  sad: "/images/reactions/sad.png",
  angry: "/images/reactions/angry.png"
};

const FilterContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  a {
    flex: 1 1 100%;
    color: #333;
    opacity: 0.6;
    svg,
    img {
      display: block;
    }
    &:hover {
      opacity: 1;
    }
  }
`;

class Filter extends React.Component {
  static propTypes = {
    size: PropTypes.string
  };
  render() {
    const { size, showAny } = this.props;
    const keys = Object.keys(imagePaths);
    return (
      <FilterContainer>
        {showAny ? (
          <a href="javascript:void(0);">
            <PopupLabel text="all">
              <FontAwesomeIcon
                icon="dot-circle"
                style={{ fontSize: sizes[size || "small"] + "px" }}
              />
            </PopupLabel>
          </a>
        ) : null}
        {keys.map(key => (
          <a href="javascript:void(0);" key={key}>
            <PopupLabel text={key}>
              <img
                src={imagePaths[key]}
                style={{
                  width: sizes[size || "small"] + "px",
                  height: sizes[size || "small"] + "px"
                }}
              />
            </PopupLabel>
          </a>
        ))}
      </FilterContainer>
    );
  }
}

export default class Reaction extends React.Component {
  static propTypes = {
    reaction: PropTypes.string.isRequired,
    size: PropTypes.string
  };
  static Filter = Filter;
  render() {
    const { reaction, size, ...props } = this.props;
    if (imagePaths[reaction.toLowerCase()]) {
      return (
        <img
          {...props}
          src={imagePaths[reaction.toLowerCase()]}
          style={{
            width: sizes[size || "small"] + "px",
            height: sizes[size || "small"] + "px"
          }}
        />
      );
    } else {
      return null;
    }
  }
}
