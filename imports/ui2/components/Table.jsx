import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.table`
  width: 100%;
  background: #fff;
  border-spacing: 0;
  border: 1px solid #ddd;
  border-radius: 7px;
  color: #444;
  tr {
    &.interactive {
      cursor: pointer;
    }
    &:hover {
      box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.07);
      position: relative;
      z-index: 2;
    }
    th,
    td {
      width: 1px;
      white-space: nowrap;
      padding: 1rem;
      line-height: 1;
      border-bottom: 1px solid #f7f7f7;
      border-right: 1px solid #f7f7f7;
      &.highlight {
        color: #000;
      }
      &.fill {
        width: auto;
        white-space: normal;
      }
      &.small {
        font-size: 0.8em;
      }
      &.icon-number {
        font-weight: 600;
        font-size: 0.9em;
        color: #999;
        text-align: center;
        svg {
          font-size: 0.7em;
          margin-right: 1rem;
        }
        span {
          color: #333;
          display: inline-block;
          width: 20px;
        }
      }
      &.last {
        text-align: right;
      }
      &.extra {
        border: 0;
        text-align: left;
        background: #333;
        font-size: 0.8em;
        color: #fff;
      }
      &:last-child {
        border-right: 0;
      }
    }
    th {
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.1rem;
      text-align: left;
      color: #999;
      font-weight: 600;
      cursor: default;
    }
    &:last-child {
      td {
        border-bottom: 0;
      }
    }
  }
`;

export default class Table extends Component {
  render() {
    const { children } = this.props;
    return <Container>{children}</Container>;
  }
}
