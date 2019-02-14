import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 20%;
  min-width: 200px;
  max-width: 300px;
  height: 100%;
  background: #e7e7e7;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  flex: 0 0 auto;
  box-sizing: border-box;
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
    font-size: 1.5em;
    font-weight: normal;
    margin: 0 2rem 2rem 1rem;
  }
  a {
    display: block;
    line-height: 1;
    color: #666;
    text-decoration: none;
    font-weight: 600;
    padding: 0.75rem 1rem;
    &:hover {
      color: #000;
    }
    &.active {
      ${"" /* padding: 0.75rem 1rem;
      margin: 0.25rem 0; */}
      color: #000;
      background: #f7f7f7;
      border-radius: 7px 0 0 7px;
    }
  }
`;

export default class Page extends Component {
  render() {
    const { children } = this.props;
    return (
      <Container>
        <NavContent>{children}</NavContent>
      </Container>
    );
  }
}
