import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 2rem;
  font-size: 0.7em;
  text-transform: uppercase;
  letter-spacing: 0.1rem;
  a {
    text-align: center;
    flex: 1 1 auto;
    color: #666;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    &:hover,
    &:active,
    &:focus {
      color: #000;
      border-color: #eee;
    }
    &.active {
      color: #333;
      border-color: #63c;
    }
  }
`;

export default Container;
