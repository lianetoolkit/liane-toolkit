import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

const Container = styled.div`
  position: relative;
  display: inline-block;
  &.top .popup {
    bottom: 100%;
    margin-bottom: 0.5rem;
  }
  &.left .popup {
    left: 0;
    margin-left: -0.5rem;
  }
  &.bottom .popup {
    top: 100%;
    margin-top: 0.5rem;
  }
  &.right .popup {
    right: 0;
    margin-right: -0.5rem;
  }
  .popup {
    background: #fff;
    border-radius: 7px;
    position: absolute;
    z-index: 15;
    padding: 0.5rem;
    border: 1px solid #ccc;
    box-shadow: 0 0.15rem 0.25rem rgba(0, 0, 0, 0.3);
  }
  ${props =>
    props.rounded &&
    css`
      .popup {
        border-radius: 2rem;
      }
    `}
`;

export default class Popup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }
  componentDidMount() {
    this.node = ReactDOM.findDOMNode(this);
    window.addEventListener("click", this._handleWindowClick);
    window.addEventListener("touchstart", this._handleWindowClick);
    window.addEventListener("keydown", this._handleKeydown);
  }
  componentWillUnmount() {
    window.removeEventListener("click", this._handleWindowClick);
    window.removeEventListener("touchstart", this._handleWindowClick);
    window.removeEventListener("keydown", this._handleKeydown);
  }
  _handleKeydown = ev => {
    if (ev.keyCode == 27) {
      this.setState({
        open: false
      });
    }
  };
  _handleClick = ev => {
    ev.preventDefault();
    const { open } = this.state;
    this.setState({
      open: !open
    });
  };
  _handleWindowClick = ev => {
    if (
      ev.target !== this.node &&
      !this.node.contains(ev.target) &&
      this.state.open
    ) {
      ev.preventDefault();
      this.close();
    }
  };
  close = () => {
    this.setState({
      open: false
    });
  };
  render() {
    const { direction, trigger, children, ...props } = this.props;
    const { open } = this.state;
    return (
      <Container className={direction || ""} {...props}>
        <a href="javascript:void(0);" onClick={this._handleClick}>
          {typeof trigger == "function" ? trigger(open) : trigger}
        </a>
        {open ? <div className="popup">{children}</div> : null}
      </Container>
    );
  }
}
