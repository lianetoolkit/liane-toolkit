import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "styled-components";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AppNav from "../components/AppNav.jsx";

const NavContainer = styled.div`
  width: 20%;
  min-width: 200px;
  max-width: 600px;
  height: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex: 0 0 auto;
  box-sizing: border-box;
  border-right: 1px solid #ccc;
  padding: 4rem 0 4rem 2rem;
  @media (min-width: 1280px) {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
  }
`;

const NavContent = styled.div`
  width: 100%;
  max-width: 200px;
  flex: 0 0 auto;
  font-size: 0.8em;
  h3 {
    color: #999;
    font-size: 1.75em;
    font-weight: normal;
    margin: 0 2rem 2rem 1rem;
  }
  a {
    display: block;
    line-height: 1;
    color: #999;
    text-decoration: none;
    font-weight: 600;
    padding: 0.75rem 1rem;
    &:hover {
      color: #000;
    }
    &.active {
      ${"" /* padding: 0.75rem 1rem;
      margin: 0.25rem 0; */} color: #000;
      background: #f7f7f7;
      border-radius: 7px 0 0 7px;
    }
  }
`;

class Nav extends Component {
  render() {
    const { children } = this.props;
    return (
      <NavContainer>
        <NavContent>{children}</NavContent>
      </NavContainer>
    );
  }
}

const ContentContainer = styled.div`
  flex: 1 1 100%;
  overflow: auto;
`;

const ContentBody = styled.div`
  max-width: 640px;
  margin: 4rem 0;
  padding: 0 4rem;
  @media (min-width: 1280px) {
    margin: 4rem auto;
  }
`;

class Content extends Component {
  render() {
    const { children } = this.props;
    return (
      <ContentContainer>
        <ContentBody>{children}</ContentBody>
      </ContentContainer>
    );
  }
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PageBody = styled.div`
  flex: 1 1 100%;
  overflow: auto;
  display: flex;
  flex-direction: row;
  position: relative;
  outline: none;
`;

const Title = styled.h1`
  font-size: 3em;
  margin: 4rem 0;
`;

export default class Page extends Component {
  static Nav = Nav;
  static Content = Content;
  static Title = Title;
  componentDidMount() {
    document.getElementById("main").focus();
  }
  render() {
    const { children } = this.props;
    const user = Meteor.user();
    return (
      <Container>
        <Header />
        {user ? (
          <AppNav
            campaigns={this.props.campaigns}
            campaignId={this.props.campaignId}
            campaign={this.props.campaign}
          />
        ) : null}
        <PageBody id="main" tabIndex="-1">
          {children}
        </PageBody>
        <Footer />
      </Container>
    );
  }
}
