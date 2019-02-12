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

const PageContent = styled.div`
  flex: 1 1 100%;
  overflow: auto;
`;

export default class Page extends Component {
  render() {
    const { children } = this.props;
    const user = Meteor.user();
    return (
      <Container>
        <Header />
        {user ? <AppNav /> : null}
        <PageContent>{children}</PageContent>
        <Footer />
      </Container>
    );
  }
}
