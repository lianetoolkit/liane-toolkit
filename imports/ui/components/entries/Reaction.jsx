import React from "react";
import PropTypes from "prop-types";

const sizes = {
  tiny: 12,
  small: 24,
  medium: 32,
  large: 46,
  huge: 64
};

// const images = {
//   like: require("/client/images/reactions/like.png"),
//   love: require("/client/images/reactions/love.png"),
//   haha: require("/client/images/reactions/haha.png"),
//   wow: require("/client/images/reactions/wow.png"),
//   sad: require("/client/images/reactions/sad.png"),
//   angry: require("/client/images/reactions/angry.png")
// };
const images = {
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
    if (images[reaction.toLowerCase()]) {
      return (
        <img
          {...props}
          src={images[reaction.toLowerCase()]}
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
