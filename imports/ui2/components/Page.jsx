import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled, { css } from "styled-components";

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
  background: #f7f7f7;
  position: relative;
  z-index: 10;
  ${(props) =>
    !props.plain &&
    css`
      padding: 2rem 0 2rem 2rem;
    `}
  h3 {
    color: #999;
    font-size: 1.2em;
    font-weight: normal;
    margin: 1rem 0 1rem 0;
    padding-top: 1rem;
    padding-right: 1rem;
    border-top: 1px solid #ddd;
    &:first-child {
      margin-top: 1rem;
      padding-top: 0;
      border: 0;
    }
  }
  .nav-content {
    a {
      display: block;
      line-height: 1;
      color: #666;
      text-decoration: none;
      font-weight: 600;
      padding: 0.75rem 1rem 0.75rem 0;
      &:hover {
        color: #000;
      }
      &.active {
        ${
          "" /* padding: 0.75rem 1rem;
        margin: 0.25rem 0; */
        } color: #000;
        background: #f7f7f7;
        border-radius: 7px 0 0 7px;
      }
    }
  }
  form {
    margin-right: 1rem;
    input[type="text"],
    input[type="email"],
    input[type="password"],
    input[type="number"] {
      padding: 0.75rem 1rem;
      border-color: #e6e6e6;
      margin: 0 0 1rem;
    }
    .select__control {
      margin-bottom: 1rem;
    }
    label {
      font-weight: normal;
      margin-bottom: 1rem;
    }
  }
  ${(props) =>
    props.padded &&
    css`
      padding-right: 1rem;
    `}
  ${(props) =>
    !props.full &&
    css`
      @media (min-width: 1280px) {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
      }
    `}
  ${(props) =>
    props.large &&
    css`
      .nav-content {
        max-width: 400px;
      }
    `}
  ${(props) =>
    props.padded &&
    css`
      .nav-content {
        margin-top: 2rem;
      }
    `}
`;

const NavContent = styled.div`
  width: 100%;
  max-width: 200px;
  flex: 0 0 auto;
  font-size: 0.8em;
`;

class Nav extends Component {
  render() {
    const { children, ...props } = this.props;
    if (props.plain) {
      return <NavContainer {...props}>{children}</NavContainer>;
    } else {
      return (
        <NavContainer {...props}>
          <NavContent className="nav-content">{children}</NavContent>
        </NavContainer>
      );
    }
  }
}

const ContentContainer = styled.div`
  flex: 1 1 100%;
  ${"" /* overflow-x: hidden;
  overflow-y: auto; */}
  ${(props) =>
    props.full &&
    css`
      .content-body {
        max-width: none;
      }
    `}
  ${(props) =>
    props.compact &&
    css`
      .content-body {
        margin: 0;
        padding: 0;
      }
    `}
  ${(props) =>
    props.plain &&
    css`
      .content-body {
        margin-left: auto;
        margin-right: auto;
      }
    `}
`;

const ContentBody = styled.div`
  max-width: 700px;
  margin: 3rem 0;
  padding: 0 3rem;
  @media (min-width: 1280px) {
    margin: 3rem auto;
  }
`;

class Content extends Component {
  render() {
    const { children, ...props } = this.props;
    return (
      <ContentContainer {...props} className="scrollable content-container">
        <ContentBody className="content-body">{children}</ContentBody>
      </ContentContainer>
    );
  }
}

const Container = styled.div`
  ${"" /* position: fixed; */}
  ${"" /* top: 0;
  left: 0; */}
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  ${"" /* overflow: auto; */}
`;

const PageBody = styled.div`
  flex: 1 1 100%;
  display: flex;
  flex-direction: row;
  position: relative;
  z-index: 1;
  outline: none;
  margin-top: 62px;
  ${(props) =>
    props.contained &&
    css`
      overflow: auto;
    `}
`;

const Boxed = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 3rem auto 2rem;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ddd;
  background: #fff;
  display: flex;
  flex-direction: column;
  ${"" /* overflow: auto; */}
  box-sizing: border-box;
  .info {
    flex: 1 1 100%;
    margin: 0 0 1rem;
  }
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  .button {
    display: block;
    margin: 0;
  }
`;

const Title = styled.h1`
  font-size: 2em;
  margin: 3rem 0;
`;

export default class Page extends Component {
  static Nav = Nav;
  static Content = Content;
  static Title = Title;
  static Boxed = Boxed;
  componentDidMount() {
    document.getElementById("main").focus();
  }
  render() {
    const {
      campaigns,
      campaign,
      notifications,
      children,
      contained,
      ...props
    } = this.props;
    return (
      <Container {...props}>
        <Header
          campaigns={campaigns}
          campaign={campaign}
          notifications={notifications || []}
        />
        <PageBody contained={contained} id="main" tabIndex="-1">
          {children}
        </PageBody>
        <Footer />
      </Container>
    );
  }
}
