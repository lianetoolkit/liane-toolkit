import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 2rem;
  font-size: 0.8em;
  font-weight: 600;
  background: #f7f7f7;
  border-bottom: 1px solid #ddd;
  a {
    text-align: center;
    flex: 1 1 auto;
    color: #666;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-bottom: 2px solid transparent;
    &:hover,
    &:active,
    &:focus {
      color: #000;
      border-color: #eee;
    }
    &.active {
      color: #333;
      border-color: #000;
    }
  }
  ${props =>
    props.dark &&
    css`
      background: #111;
      a {
        color: rgba(255, 255, 255, 0.6);
        &:hover,
        &:active,
        &:focus {
          color: #fff;
          border-color: rgba(0, 0, 0, 0.3);
        }
        &.active {
          color: #f7f7f7;
          border-color: #212121;
        }
      }
    `}
`;

export default class TabNav extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <Container {...props} className="tab-nav">
        {children}
      </Container>
    );
  }
}
