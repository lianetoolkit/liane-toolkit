import React, { Component } from "react";
import styled from "styled-components";

const Container = styled.footer`
  flex: 0;
  padding: 0.5rem;
  background: #333;
  border-top: 1px solid #222;
  .footer-content {
    color: #999;
    font-size: 0.8em;
    max-width: 960px;
    margin: 0 auto;
    p {
      margin: 0;
    }
  }
`;

export default class Footer extends Component {
  render() {
    return (
      <Container>
        <div className="footer-content">
          <p>A project by Instituto Update</p>
        </div>
      </Container>
    );
  }
}
