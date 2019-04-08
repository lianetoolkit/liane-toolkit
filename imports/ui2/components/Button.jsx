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

const ButtonGroupContainer = styled.span`
  display: flex;
  .button {
    flex: 1 1 100%;
    border-radius: 0;
    margin: 0;
    border-radius: 0;
    &:first-child {
      border-radius: 3rem 0 0 3rem;
    }
    &:last-child {
      border-radius: 0 3rem 3rem 0;
    }
  }
  ${props =>
    props.vertical &&
    css`
      flex-direction: column;
      .button {
        border-bottom-width: 0;
      }
      .button:first-child {
        border-radius: 7px 7px 0 0;
      }
      .button:last-child {
        border-radius: 0 0 7px 7px;
        border-bottom-width: 1px;
      }
    `}
`;

export default class Button extends Component {
  static Group = ButtonGroupContainer;
  render() {
    const { children, ...props } = this.props;
    return (
      <ButtonContainer className="button" {...props}>
        {children}
      </ButtonContainer>
    );
  }
}
