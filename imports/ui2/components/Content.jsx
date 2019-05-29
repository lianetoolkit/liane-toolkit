import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  padding: 2rem;
  box-sizing: border-box;
  margin: 0 auto;
  ${props =>
    props.full &&
    css`
      max-width: none;
    `};
`;

export default Container;
