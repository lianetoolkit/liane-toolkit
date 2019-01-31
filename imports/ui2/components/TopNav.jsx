import React, { Component } from "react";
import styled from "styled-components";

const TopNav = styled.nav`
  display: flex;
  flex-grow: 1;
  flex-wrap: nowrap;
  font-weight: 600;
  font-size: 1em;
  a {
    color: #fff;
    text-decoration: none;
    display: block;
    white-space: nowrap;
    margin-left: 1.5rem;
    border-bottom: 2px solid transparent;
    &:hover,
    &:focus,
    &:active {
      border-color: #fff;
    }
  }
`;

export default TopNav;
