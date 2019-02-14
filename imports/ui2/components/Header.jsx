import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.header`
  background: #222;
  padding: 2rem 0 1rem;
  font-size: 0.8em;
  flex: 0;
  .header-content {
    max-width: 960px;
    padding: 0 2rem;
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
