import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.table`
  width: 100%;
  background: #fff;
  border-spacing: 0;
  border: 1px solid #ddd;
  border-radius: 7px;
  tr {
    &:hover {
      box-shadow: 0 0.1rem 0.5rem rgba(0, 0, 0, 0.07);
      position: relative;
      z-index: 2;
      td {
        border-color: #ddd;
      }
    }
    td {
      padding: 1rem;
      line-height: 1;
      border-bottom: 1px solid #f7f7f7;
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
