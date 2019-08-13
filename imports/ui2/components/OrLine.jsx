import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 1px;
  border-bottom: 1px solid #eee
  margin: 1rem 0;
  .or-text {
    font-size: 0.8em;
    color: #999;
    flex: 0 0 auto;
    background: #fff;
    padding: 0 1rem;
  }
`;

export default class OrLine extends Component {
  render() {
    const text = this.props.children || "or";
    return (
      <Container className="or-line">
        <span className="or-text">{text}</span>
      </Container>
    );
  }
}
