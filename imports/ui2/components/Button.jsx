import React, { Component } from "react";
import styled, { css } from "styled-components";

const styles = css`
  text-align: center;
  color: #330066;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 7px;
  border: 1px solid rgba(51, 0, 102, 0.25);
  background: rgba(255, 255, 255, 0.6);
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
  font-size: 0.9em;
  &:hover,
  &:focus,
  &:active,
  &.active {
    background: #333;
    color: #fff;
  }
  &.with-icon {
    padding: 0;
    display: flex;
    > a {
      flex: 1 1 100%;
      padding: 0.5rem 1rem;
      color: #330066;
      text-decoration: none;
      &:hover {
        color: inherit;
      }
    }
    .icon {
      flex: 0 0 auto;
      padding: 0.5rem 1rem;
      border-left: 1px solid #330066;
    }
    &:hover {
      .icon {
        border-color: #000;
      }
    }
  }
  &.primary {
    background: #f5911e;
    color: #fff;
    &:hover,
    &:active,
    &:focus,
    &.active {
      background: #333;
    }
  }
  &.disabled,
  &.disabled:hover,
  &.disabled:active,
  &.disabled:focus {
    background: #ddd;
    color: #fff;
    cursor: default;
    border-color: #fff;
  }
  &.small {
    font-size: 0.8em;
    padding: 0.4rem 0.8rem;
  }
  ${(props) =>
    props.light &&
    css`
      border-color: rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      &:hover,
      &:focus,
      &:active {
        background: #333;
        color: #fff;
      }
    `}
`;

const ButtonContainer = styled.a(styles);

const ButtonIconContainer = styled.span(styles);

const ButtonGroupContainer = styled.span`
  display: flex;
  .button {
    flex: 1 1 100%;
    border-radius: 0;
    margin: 0;
    border-radius: 0;
  }
  &.toggler {
    .button {
      &:hover,
      &:focus,
      &:active {
        background-color: rgba(51, 0, 102, 0.5);
        color: #fff;
      }
      &.active {
        background-color: #330066;
        color: #fff;
      }
    }
  }
  ${(props) =>
    !props.attached &&
    css`
      .button {
        border-left-width: 0;
        border-radius: 0;
      }
      .button:first-child {
        border-top-left-radius: 7px;
        border-bottom-left-radius: 7px;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-left-width: 1px;
      }
      .button:last-child {
        border-top-right-radius: 7px;
        border-bottom-right-radius: 7px;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
      .button:only-child {
        border-top-right-radius: 7px;
        border-bottom-right-radius: 7px;
        border-top-left-radius: 7px;
        border-bottom-left-radius: 7px;
      }
    `}
  ${(props) =>
    props.vertical &&
    css`
      flex-direction: column;
      .button {
        border-bottom-width: 0;
        border-left-width: 1px;
      }
      .button:last-child {
      }
      ${(props) =>
        !props.attached &&
        css`
          .button {
            border-radius: 0;
          }
          .button:first-child {
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            border-bottom-right-radius: 0;
            border-bottom-left-radius: 0;
          }
          .button:last-child {
            border-bottom-left-radius: 7px;
            border-bottom-right-radius: 7px;
            border-top-left-radius: 0;
            border-top-right-radius: 0;
            border-bottom-width: 1px;
          }
          .button:only-child {
            border-top-left-radius: 7px;
            border-top-right-radius: 7px;
            border-bottom-left-radius: 7px;
            border-bottom-right-radius: 7px;
          }
        `}
    `}
`;

class ButtonGroup extends Component {
  render() {
    const { children, toggler, ...props } = this.props;
    let className = "button-group";
    if (toggler) className += " toggler";
    return (
      <ButtonGroupContainer className={className} {...props}>
        {children}
      </ButtonGroupContainer>
    );
  }
}

class ButtonIcon extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <ButtonIconContainer className="button with-icon" {...props}>
        {children}
      </ButtonIconContainer>
    );
  }
}

export default class Button extends Component {
  static Group = ButtonGroup;
  static WithIcon = ButtonIcon;
  _handleClick = (ev) => {
    const { onClick, disabled } = this.props;
    if (disabled) {
      return;
    }
    if (typeof onClick == "function") {
      onClick(ev);
    }
  };
  render() {
    const { children, active, primary, small, disabled, ...props } = this.props;
    let className = "button";
    if (active) className += " active";
    if (primary) className += " primary";
    if (disabled) className += " disabled";
    if (small) className += " small";
    if (!props.href) props.href = "#";
    return (
      <ButtonContainer
        className={className}
        {...props}
        onClick={this._handleClick}
      >
        {children}
      </ButtonContainer>
    );
  }
}
