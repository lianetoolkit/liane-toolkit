import React, { Component } from "react";
import styled from "styled-components";

import AppNav from "../components/AppNav.jsx";

const Container = styled.header`
  background: #333;
  padding: 0;
  flex: 0;
  .header-content {
    max-width: 960px;
    padding: 0 2rem;
    margin: 0 auto;
    line-height: 1;
    .brand {
      margin: 1rem 0.8rem 0.8rem 0;
      float: left;
      font-family: "Unica One", monospace;
      position: relative;
      z-index: 15;
    }
    .brand h1 {
      margin: 0;
      padding: 0;
    }
    .brand h1 img {
      display: block;
      width: auto;
      height: 28px;
    }
  }
`;

const TopNav = styled.nav`
  display: flex;
  flex-wrap: nowrap;
  font-weight: 600;
  font-size: 0.7em;
  justify-content: flex-end;
  padding-top: 0.5rem;
  a {
    color: #999;
    text-decoration: none;
    display: block;
    white-space: nowrap;
    margin-left: 1rem;
    &:hover,
    &:focus,
    &:active {
      color: #fff;
    }
  }
`;

export default class Header extends Component {
  render() {
    const { campaign, campaigns } = this.props;
    const user = Meteor.user();
    return (
      <Container>
        <div className="header-content">
          <div className="brand">
            <h1>
              <a href={FlowRouter.path("App.dashboard")}>
                <img
                  src={user ? "/images/logo_icon.svg" : "/images/logo_dark.svg"}
                  alt="Liane"
                />
              </a>
            </h1>
          </div>
          <TopNav>
            <a href="#">Como funciona</a>
            <a
              href="https://institutoupdate.org.br"
              target="_blank"
              rel="external"
            >
              Instituto Update
            </a>
            <a href="#">Termos de uso</a>
          </TopNav>
          {user ? <AppNav campaign={campaign} campaigns={campaigns} /> : null}
        </div>
      </Container>
    );
  }
}
