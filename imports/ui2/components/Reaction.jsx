import React from "react";
import PropTypes from "prop-types";

const sizes = {
  tiny: 12,
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

export default class Reaction extends React.Component {
  static propTypes = {
    reaction: PropTypes.string.isRequired,
    size: PropTypes.string
  };
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
