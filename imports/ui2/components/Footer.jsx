import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

const Container = styled.footer`
  flex: 0 0 auto;
  width: 100%;
  z-index: 1000;
  height: 36px;
  .footer-body {
    position: fixed;
    border-top: 1px solid #222;
    background: #330066;
    bottom: 0;
    left: 0;
    width: 100%;
  }
  .footer-content {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8em;
    max-width: 1000px;
    margin: 0 auto;
    padding: 0.5rem;
    p {
      margin: 0;
    }
  }
`;

export default class Footer extends Component {
  render() {
    return (
      <Container>
        <div className="footer-body">
          <div className="footer-content">
            <p>
              <FormattedMessage
                id="app.footer.project_by"
                defaultMessage="A project by Instituto Update"
              />
            </p>
          </div>
        </div>
      </Container>
    );
  }
}
