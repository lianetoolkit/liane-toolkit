import React, { Component } from "react";
import { injectIntl, intlShape, defineMessages } from "react-intl";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import PropTypes from "prop-types";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const messages = defineMessages({
  noReaction: {
    id: "app.facebook.no_reaction",
    defaultMessage: "No reaction",
  },
  oneReaction: {
    id: "app.facebook.one_reaction",
    defaultMessage: "1 reaction",
  },
  anyReactions: {
    id: "app.facebook.any_reactions",
    defaultMessage: "{count} reactions",
  },
});

const sizes = {
  tiny: 16,
  small: 24,
  medium: 32,
  large: 46,
  huge: 64,
};

const REACTIONS = [
  "like",
  "care",
  "pride",
  "love",
  "haha",
  "wow",
  "sad",
  "angry",
  "thankful",
];

const imagePaths = {
  like: "/images/reactions/like.png",
  care: "/images/reactions/care.png",
  pride: "/images/reactions/pride.png",
  love: "/images/reactions/love.png",
  haha: "/images/reactions/haha.png",
  wow: "/images/reactions/wow.png",
  sad: "/images/reactions/sad.png",
  angry: "/images/reactions/angry.png",
  thankful: "/images/reactions/thankful.png",
};

const FilterContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  text-align: center;
  a {
    flex: 1 1 100%;
    color: #333;
    text-align: center;
    svg,
    img {
      opacity: 0.6;
      display: inline-block;
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

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
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
    size: PropTypes.string,
  };
  _handleClick = (type) => (ev) => {
    const { selected } = this.state;
    this.setState({
      selected: selected == type ? false : type,
    });
  };
  render() {
    const { size, showAny, target } = this.props;
    const { selected } = this.state;
    const keys = Object.keys(imagePaths);
    let className = "reaction-filter";
    if (selected) {
      className += " has-selection";
    }
    let tooltipId = "reaction-filter";
    if (target) {
      tooltipId += `-${target}`;
    }
    return (
      <>
        <FilterContainer className={className}>
          {showAny ? (
            <a
              href="javascript:void(0);"
              onClick={this._handleClick("any")}
              className={selected == "any" ? "active" : ""}
            >
              <FontAwesomeIcon
                icon="dot-circle"
                style={{ fontSize: sizes[size || "small"] + "px" }}
                data-tip="all"
                data-for={tooltipId}
              />
            </a>
          ) : null}
          {keys.map((key) => (
            <a
              href="javascript:void(0);"
              key={key}
              onClick={this._handleClick(key)}
              className={selected == key ? "active" : ""}
            >
              <img
                src={imagePaths[key]}
                style={{
                  width: sizes[size || "small"] + "px",
                  height: sizes[size || "small"] + "px",
                }}
                data-tip={key}
                data-for={tooltipId}
              />
            </a>
          ))}
        </FilterContainer>
        <ReactTooltip id={tooltipId} effect="solid" />
      </>
    );
  }
}

const CountContainer = styled.div`
  font-size: 0.8em;
  background: #fff;
  border: 1px solid #e7e7e7;
  padding: 0.15rem 0.35rem;
  border-radius: 7px;
  display: flex;
  align-items: center;
  .reactions {
    display: flex;
    align-items: center;
    margin-right: 0.7rem;
    img {
      border-radius: 100%;
      display: inline-block;
      border: 1px solid #fff;
      margin-right: -5px;
    }
  }
  .total {
    color: #999;
  }
  .__react_component_tooltip.type-dark.place-top {
    padding: 0.25rem 0.5rem;
    &:after {
      bottom: -3px;
      border-top-width: 3px;
      margin-left: -4px;
      border-left-width: 4px;
      border-right-width: 4px;
    }
  }
`;

class Count extends Component {
  label = () => {
    const { intl, total } = this.props;
    if (!total || total == 0) {
      return intl.formatMessage(messages.noReaction);
    } else if (total == 1) {
      return intl.formatMessage(messages.oneReaction);
    } else {
      return intl.formatMessage(messages.anyReactions, { count: total });
    }
  };
  render() {
    const { counts, total, target } = this.props;
    if (typeof counts !== "object") return null;
    const values = Object.keys(counts)
      .map((k) => {
        return {
          k,
          v: counts[k] || 0,
        };
      })
      .filter((item) => {
        return REACTIONS.indexOf(item.k) !== -1 && item.v > 0;
      })
      .sort((a, b) => {
        return b.v - a.v;
      });

    let tooltipId = "reaction-count";
    if (target) {
      tooltipId += `-${target}`;
    }
    return (
      <CountContainer className="reaction-count">
        {values.length ? (
          <span className="reactions">
            {values.map((item, i) => (
              <img
                key={i}
                src={imagePaths[item.k]}
                style={{
                  width: "14px",
                  height: "14px",
                }}
                data-tip={item.v}
                data-for={tooltipId}
              />
            ))}
          </span>
        ) : null}
        <span className="total">{this.label()}</span>
        <ReactTooltip id={tooltipId} effect="solid" />
      </CountContainer>
    );
  }
}

Count.propTypes = {
  intl: intlShape.isRequired,
};

const CountIntl = injectIntl(Count);

export default class Reaction extends Component {
  static propTypes = {
    reaction: PropTypes.string.isRequired,
    size: PropTypes.string,
  };
  static Filter = Filter;
  static Count = CountIntl;
  render() {
    const { reaction, size, ...props } = this.props;
    if (imagePaths[reaction.toLowerCase()]) {
      return (
        <img
          {...props}
          src={imagePaths[reaction.toLowerCase()]}
          style={{
            width: sizes[size || "small"] + "px",
            height: sizes[size || "small"] + "px",
          }}
        />
      );
    } else {
      return null;
    }
  }
}
