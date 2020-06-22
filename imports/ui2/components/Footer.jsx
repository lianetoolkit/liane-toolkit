import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

const Container = styled.footer`
  flex: 0;
  padding: 0.5rem;
  background: #330066;
  border-top: 1px solid #222;
  .footer-content {
    color: rgba(255, 255, 255, 0.6);
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
          <p>
            <FormattedMessage
              id="app.footer.project_by"
              defaultMessage="A project by Instituto Update"
            />
          </p>
        </div>
      </Container>
    );
  }
}
