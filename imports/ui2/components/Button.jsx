import React, { Component } from "react";
import styled, { css } from "styled-components";

const ButtonContainer = styled.a`
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

export default class Button extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <ButtonContainer className="button" {...props}>
        {children}
      </ButtonContainer>
    );
  }
}
