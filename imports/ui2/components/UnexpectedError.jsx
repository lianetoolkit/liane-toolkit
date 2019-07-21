import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 1.2em;
  p {
    color: #999;
    font-style: italic;
  }
  .button {
    padding: 1rem 2rem;
  }
`;

export default function() {
  return (
    <Container>
      <h2>Unexpected error</h2>
      <p>Please, try again later.</p>
    </Container>
  );
}
