import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.div`
  display: flex;
  width: 100%;
  > div {
    flex: 1 1 auto;
    padding: 0.5rem;
  }
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
    li {
      margin: 0 0 0.5rem;
      padding: 0 0 0.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      &:last-child {
        margin: 0;
        padding: 0;
        border-bottom: 0;
      }
      svg {
        margin-right: 0.5rem;
      }
    }
  }
`;

export default class PersonSummary extends Component {
  render() {
    return (
      <Container>
        <div>
          <ul>
            <li>
              <FontAwesomeIcon icon="envelope" /> Não disponível
            </li>
            <li>
              <FontAwesomeIcon icon="phone" /> Não disponível
            </li>
          </ul>
        </div>
        <div>Teste</div>
      </Container>
    );
  }
}
