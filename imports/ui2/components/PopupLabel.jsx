import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";
import { debounce } from "lodash";

const Container = styled.span`
  display: inline-block;
  position: relative;
  .label {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    letter-spacing: normal;
    white-space: nowrap;
    opacity: 0;
    position: absolute;
    bottom: 100%;
    margin-bottom: 5px;
    margin-left: -0.5rem;
    left: 0;
    padding: 0.2rem 0.5rem;
    line-height: 1;
    background: rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.5);
    color: #fff;
    pointer-events: none;
    transition: opacity 0.1s linear;
    border-radius: 7px;
    font-size: 12px;
    .extra {
      font-size: 0.8em;
      color: rgba(255, 255, 255, 0.5);
      padding: 0 0.3rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 7px;
    }
  }
  &:hover .label {
    opacity: 1;
    z-index: 10;
  }
  ${props =>
    props.position &&
    props.position.indexOf("center") !== -1 &&
    css`
      .label {
        left: 50%;
      }
    `}
  ${props =>
    props.position &&
    props.position.indexOf("bottom") !== -1 &&
    css`
      .label {
        bottom: auto;
        top: 100%;
        margin-top: 5px;
        margin-bottom: 0;
      }
    `}
`;

export default class PopupLabel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      labelMargins: {
        left: 0,
        right: 0
      }
    };
  }
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    this.calcMargins();
    window.addEventListener("resize", this.calcMargins);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.calcMargins);
  }
  calcMargins = debounce(() => {
    if (this.node) {
      const { position } = this.props;
      const labelNode = this.node.getElementsByClassName("label")[0];
      const rect = labelNode.getBoundingClientRect();
      const rightDistance = window.innerWidth - (rect.width + rect.x);
      const leftDistance = rect.left;
      let calculatedLeft = 0;
      if (position && position.indexOf("center") !== -1) {
        calculatedLeft = -(rect.width / 2);
      }
      if (rect.x + calculatedLeft > 0 && rightDistance - calculatedLeft < 0) {
        calculatedLeft = rightDistance - 20;
      } else if (rect.x + calculatedLeft < 0) {
        calculatedLeft = -rect.left + 20;
      }
      if (calculatedLeft) {
        this.setState({
          labelMargins: {
            left: calculatedLeft
          }
        });
      }
    }
  }, 200);
  _handleMouseEnter = () => {
    const { labelMargins } = this.state;
    const labelNode = this.node.getElementsByClassName("label")[0];
    const rect = labelNode.getBoundingClientRect();
    labelNode.style.top = rect.y + "px";
    labelNode.style.left = rect.x - labelMargins.left + "px";
    labelNode.style.bottom = "auto";
    labelNode.style.position = "fixed";
  };
  _handleMouseLeave = () => {
    const labelNode = this.node.getElementsByClassName("label")[0];
    labelNode.style.top = null;
    labelNode.style.left = null;
    labelNode.style.bottom = null;
    labelNode.style.position = null;
  };
  render() {
    const {
      text,
      extra,
      children,
      disabled,
      bottomOffset,
      ...props
    } = this.props;
    const { labelMargins } = this.state;
    let style = {};
    if (bottomOffset) {
      style["marginBottom"] = bottomOffset;
    }
    style["marginLeft"] = labelMargins.left + "px";
    style["marginRight"] = labelMargins.right + "px";
    if (disabled) {
      style["opacity"] = "0";
    }
    return (
      <Container
        {...props}
        onMouseEnter={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        {children}
        <span className="label" style={style}>
          {text} {extra ? <span className="extra">{extra}</span> : null}
        </span>
      </Container>
    );
  }
}
