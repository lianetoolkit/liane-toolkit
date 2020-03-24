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
  display: flex;
  flex-direction: column;
  ${props =>
    props.primary &&
    css`
      border-radius: 1rem;
      background: #f5911e;
      border-color: #f5911e;
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
          color: rgba(255, 255, 255, 0.5);
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
  ${props =>
    props.minimal &&
    css`
      background: transparent;
      border: 0;
      header {
        text-align: center;
        margin: 0 0 1rem;
        flex: 0 0 auto;
        svg {
          font-size: 3em;
          color: #999;
          margin: 1rem 0;
        }
        h3 {
          text-align: center;
          font-weight: 600;
          margin: 0;
          font-size: 1.5em;
        }
      }
      section {
        flex: 1 1 100%;
        font-size: 0.9em;
        display: flex;
        align-items: center;
        justify-content: center;
        p {
          margin: 0 0 1rem;
        }
      }
      footer {
        a.button {
          margin: 0;
          display: block;
        }
      }
    `}
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
    const { minimal, grow, children, ...props } = this.props;
    const flexGrow = grow || 1;
    return (
      <BoxContainer
        minimal={minimal}
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
