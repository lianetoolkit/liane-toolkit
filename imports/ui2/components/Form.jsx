import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.form`
  max-width: 600px;
  input,
  .button {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 1.25rem;
    line-height: 1;
    margin: 0 0 1rem;
    border: 0;
    border: 1px solid #ccc;
    border-radius: 0;
    background: #f7f7f7;
    font-size: 1em;
    border-radius: 1.5rem;
    font-family: "Open Sans", "Helvetica", "Arial", sans-serif;
    &:focus {
      background: #fff;
    }
  }
`;

export default Container;
