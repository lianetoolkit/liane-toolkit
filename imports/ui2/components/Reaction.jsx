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
    svg,
    img {
      opacity: 0.6;
      display: block;
    }
    &:hover {
      opacity: 1;
    }
  }
  &.has-selection {
    a {
      svg,
      img {
        opacity: 0.4;
      }
      &.active {
        svg,
        img {
          opacity: 1;
        }
      }
    }
  }
`;

class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false
    };
  }
  componentDidMount() {
    if (this.props.value) {
      this.setState({ selected: this.props.value });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { onChange } = this.props;
    const { selected } = this.state;
    if (prevState.selected != selected && onChange) {
      onChange(selected);
    }
  }
  static propTypes = {
    size: PropTypes.string
  };
  _handleClick = type => ev => {
    const { selected } = this.state;
    this.setState({
      selected: selected == type ? false : type
    });
  };
  render() {
    const { size, showAny } = this.props;
    const { selected } = this.state;
    const keys = Object.keys(imagePaths);
    return (
      <FilterContainer className={selected ? "has-selection" : ""}>
        {showAny ? (
          <a
            href="javascript:void(0);"
            onClick={this._handleClick("any")}
            className={selected == "any" ? "active" : ""}
          >
            <PopupLabel text="all" position="center">
              <FontAwesomeIcon
                icon="dot-circle"
                style={{ fontSize: sizes[size || "small"] + "px" }}
              />
            </PopupLabel>
          </a>
        ) : null}
        {keys.map(key => (
          <a
            href="javascript:void(0);"
            key={key}
            onClick={this._handleClick(key)}
            className={selected == key ? "active" : ""}
          >
            <PopupLabel text={key} position="center">
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
