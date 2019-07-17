import React, { Component } from "react";
import styled, { css } from "styled-components";

const Container = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 2rem 0 0;
`;

const RowContainer = styled.div`
  ${"" /* max-width: 1280px; */} margin: 0 auto;
  display: flex;
  padding: 0 1.5rem;
  flex-grow: 1;
  box-sizing: border-box;
  width: 100%;
  flex-wrap: wrap;
`;

const BoxContainer = styled.div`
  flex: 1;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 7px;
  margin: 0 0.5rem 1rem 0.5rem;
  padding: 1rem 1.5rem;
  box-sizing: border-box;
  ${props =>
    props.primary &&
    css`
      border-radius: 1rem;
      background: #63c;
      border-color: #63c;
      color: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .links {
        margin-top: 1rem;
        text-align: center;
        p {
          margin-bottom: 0.25rem;
        }
        a {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 0.8em;
        }
        .button {
          border: 0;
          color: #63c;
          margin: 0;
          background: #fff;
          display: block;
          width: 100%;
          &:hover,
          &:active,
          &:focus {
            background-color: #333;
            color: #fff;
          }
        }
      }
    `};
  ${props =>
    props.attached &&
    css`
      padding: 0;
    `}
  .button {
    font-size: 0.8em;
  }
`;

const BoxTitle = styled.h3`
  margin: 0 0 1rem;
  padding: 0 0 1rem;
  border-bottom: 1px solid #ddd;
  line-height: 1;
  font-size: 0.8em;
  color: #666;
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
  static Title = BoxTitle;
  render() {
    return <Container>{this.props.children}</Container>;
  }
}

export default Dashboard;
