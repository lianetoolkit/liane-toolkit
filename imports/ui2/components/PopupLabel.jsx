import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";
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
    margin-bottom: 0.3rem;
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
    font-size: 0.8em;
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
      const labelNode = this.node.getElementsByClassName("label")[0];
      const rect = labelNode.getBoundingClientRect();
      const rightDistance = window.innerWidth - (rect.width + rect.x);
      const leftDistance = rect.left;
      if (rect.x > 0 && rightDistance < 0) {
        this.setState({
          labelMargins: {
            left: rightDistance - 20
          }
        });
      } else if (rect.x < 0) {
        this.setState({
          labelMargins: {
            left: -rect.left + 20
          }
        });
      }
    }
  }, 350);
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
      <Container {...props}>
        {children}
        <span className="label" style={style}>
          {text} {extra ? <span className="extra">{extra}</span> : null}
        </span>
      </Container>
    );
  }
}
