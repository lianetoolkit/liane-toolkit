import React, { Component } from "react";
import styled from "styled-components";

const Button = styled.a`
  width: 100%;
  text-align: center;
  color: #6633cc;
  text-decoration: none;
  padding: 0.5rem 2rem;
  margin: 0 0.5rem;
  border-radius: 3rem;
  border: 1px solid #6633cc;
  background: rgba(255, 255, 255, 0.6);
  &:hover,
  &:focus,
  &:active {
    background: #fff;
    border-color: #000;
    color: #000;
  }
`;

export default Button;
