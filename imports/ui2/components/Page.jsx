import React, { Component } from "react";
import styled from "styled-components";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import AppNav from "../components/AppNav.jsx";

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
`;

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

export default class Page extends Component {
  static Content = Content;
  render() {
    const { children } = this.props;
    const user = Meteor.user();
    return (
      <Container>
        <Header />
        {user ? <AppNav /> : null}
        <PageBody>{children}</PageBody>
        <Footer />
      </Container>
    );
  }
}
