import React, { Component } from "react";
import styled, { css } from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }
  @keyframes wiggle {
    0% {
      transform: rotate(0deg);
    }
    25% {
      transform: rotate(10deg);
    }
    50% {
      transform: rotate(-10deg);
    }
    75% {
      transform: rotate(10deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }
  padding: 2rem;
  font-size: 2em;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(0, 0, 0, 0.2);
  svg {
    animation: rotate 2s linear infinite;
  }
  ${props =>
    props.full &&
    css`
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      z-index: 100;
      background: rgba(255, 255, 255, 0.75);
      font-size: 3em;
    `}
`;

export default class Loading extends Component {
  render() {
    return (
      <Container className="loading" {...this.props}>
        <FontAwesomeIcon icon="spinner" />
      </Container>
    );
  }
}
