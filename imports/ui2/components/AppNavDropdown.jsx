import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  display: inline-block;
  font-weight: 400;
  z-index: 2;
  .trigger {
    cursor: pointer;
  }
  .dropdown {
    position: absolute;
    top: 47px;
    right: -25px;
    width: 380px;
    height: 300px;
    background: #fff;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.07);
    border-radius: 0 0 1.65rem 1.65rem;
    display: flex;
    flex-direction: column;
    border: 1px solid #ddd;
    &:before {
      content: "";
      background: #fff;
      position: absolute;
      width: 16px;
      height: 16px;
      top: -6px;
      right: 32px;
      transform: rotate(45deg);
      border: 1px solid #ddd;
    }
    &:after {
      content: "";
      background: #fff;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 20px;
      z-index: 1;
    }
  }
  &.has-tools {
    .dropdown:before {
      background: #f0f0f0;
    }
  }
`;

const TriggerCount = styled.span`
  position: absolute;
  bottom: -0.5rem;
  right: -0.5rem;
  display: block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background: red;
  color: #fff;
  font-weight: 600;
  border-radius: 100%;
  font-size: 0.8em;
`;

const Tools = styled.div`
  flex-grow: 0;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #dedede;
  text-align: right;
  font-size: 0.7em;
  background: #f0f0f0;
  position: relative;
  z-index: 2;
  a {
    display: inline-block;
    margin-left: 0.75rem;
    color: #999;
    &:hover {
      color: #333;
    }
  }
  .close {
    color: #000;
    &:hover {
      color: #333;
    }
  }
`;

const Content = styled.div`
  flex-grow: 1;
  overflow: auto;
  box-sizing: border-box;
  font-size: 0.8em;
  position: relative;
  z-index: 2;
  padding: 0.5rem 0 1.65rem 0;
`;

const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: #ccc;
  margin: 0.5rem 0;
`;

const NavItem = styled.a`
  display: block;
  padding: 0.25rem 1.5rem;
  color: #666;
  text-decoration: none;
  /* border-bottom: 1px solid #f0f0f0; */
  font-weight: 600;
  &:hover {
    color: #111;
    background: #f0f0f0;
  }
  &:last-child {
    border: 0;
  }
`;

export default class AppNavDropdown extends Component {
  static Tools = Tools;
  static Content = Content;
  static Separator = Separator;
  static NavItem = NavItem;
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  toggle = () => () => {
    const { open } = this.state;
    this.setState({
      open: !open
    });
  };
  render() {
    const { open } = this.state;
    const {
      width,
      height,
      tools,
      trigger,
      triggerCount,
      children,
      className,
      ...props
    } = this.props;
    let classes = className || "";
    if (tools) {
      classes += " has-tools";
    }
    let style = {};
    if (width) {
      style["width"] = width;
    }
    if (height) {
      style["height"] = height;
    }
    return (
      <Container className={classes} {...props}>
        <span className="trigger" onClick={this.toggle()}>
          {trigger}
        </span>
        {triggerCount ? <TriggerCount>{triggerCount}</TriggerCount> : null}
        {open ? (
          <div className="dropdown" style={style}>
            {tools ? (
              <AppNavDropdown.Tools>{tools}</AppNavDropdown.Tools>
            ) : null}
            {children}
          </div>
        ) : null}
      </Container>
    );
  }
}
