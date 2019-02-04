import React, { Component } from "react";
import styled from "styled-components";

import TopNav from "./TopNav.jsx";

const Container = styled.header`
  background: #222;
  padding: 2rem 0 1rem;
  font-size: 0.8em;
  flex: 0;
  .header-content {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    line-height: 1;
    .brand {
      width: 100%;
      font-family: "Unica One", monospace;
    }
    .brand h1 {
      margin: 0;
      padding: 0;
    }
    .brand h1 img {
      width: 125px;
      height: auto;
    }
  }
`;

export default class Header extends Component {
  render() {
    return (
      <Container>
        <div className="header-content">
          <div className="brand">
            <h1>
              <img src="/images/logo_dark.svg" alt="Liane" />
            </h1>
          </div>
          <TopNav>
            <a href="#">Como funciona</a>
            <a href="#">Instituto Update</a>
            <a href="#">Termos de uso</a>
          </TopNav>
        </div>
      </Container>
    );
  }
}
