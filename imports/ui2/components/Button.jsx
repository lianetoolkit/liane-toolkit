import React, { Component } from "react";
import styled, { css } from "styled-components";

const styles = css`
  width: 100%;
  text-align: center;
  color: #6633cc;
  text-decoration: none;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border-radius: 3rem;
  border: 1px solid #6633cc;
  background: rgba(255, 255, 255, 0.6);
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
  &:hover,
  &:focus,
  &:active {
    background: #fff;
    border-color: #000;
    color: #000;
  }
  &.with-icon {
    padding: 0;
    display: flex;
    > a {
      flex: 1 1 100%;
      padding: 0.5rem 1rem;
      color: #6633cc;
      text-decoration: none;
      &:hover {
        color: inherit;
      }
    }
    .icon {
      flex: 0 0 auto;
      padding: 0.5rem 1rem;
      border-left: 1px solid #6633cc;
    }
    &:hover {
      .icon {
        border-color: #000;
      }
    }
  }
  ${props =>
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
  ${props =>
    !props.attached &&
    css`
      .button:first-child {
        border-radius: 3rem 0 0 3rem;
      }
      .button:last-child {
        border-radius: 0 3rem 3rem 0;
      }
    `}
  ${props =>
    props.vertical &&
    css`
      flex-direction: column;
      .button {
        border-bottom-width: 0;
      }
      .button:last-child {
      }
      ${props =>
        !props.attached &&
        css`
          .button:first-child {
            border-radius: 7px 7px 0 0;
          }
          .button:last-child {
            border-radius: 0 0 7px 7px;
            border-bottom-width: 1px;
          }
        `}
    `}
`;

class ButtonGroup extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <ButtonGroupContainer className="button-group" {...props}>
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
  render() {
    const { children, ...props } = this.props;
    return (
      <ButtonContainer className="button" {...props}>
        {children}
      </ButtonContainer>
    );
  }
}
