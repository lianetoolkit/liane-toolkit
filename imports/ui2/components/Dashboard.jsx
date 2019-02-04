import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  flex: 1 1 100%;
  padding: 2rem 0 0;
  overflow: auto;
`;

const RowContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  padding: 0 0.5rem 1rem 0.5rem;
  flex-grow: 1;
  box-sizing: border-box;
  width: 100%;
`;

const BoxContainer = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 0 0.5rem;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  ${props =>
    props.primary &&
    css`
      border-radius: 1rem;
      background: #63c;
      border-color: #63c;
      color: #fff;
    `};
`;

class Row extends Component {
  render() {
    return <RowContainer>{this.props.children}</RowContainer>;
  }
}

class Box extends Component {
  render() {
    const { grow, children, ...props } = this.props;
    const flexGrow = grow || 1;
    return (
      <BoxContainer
        style={{
          flex: flexGrow
        }}
        {...props}
      >
        {children}
      </BoxContainer>
    );
  }
}

class Dashboard extends Component {
  static Row = Row;
  static Box = Box;
  render() {
    return <Container>{this.props.children}</Container>;
  }
}

export default Dashboard;
