import React, { Component } from "react";
import styled from "styled-components";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";

import Loading from "./Loading.jsx";

const Container = styled.div`
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #306;
  .first-run-content {
    max-width: 500px;
    background: #fff;
    border-radius: 7px;
    border: 1px solid #ccc;
    box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
    padding: 2rem;
    h2 {
      font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      margin: 0;
    }
    p {
      font-size: 0.8em;
      font-style: italic;
      color: #999;
    }
  }
`;

class FirstRun extends Component {
  constructor(props) {
    super(props);
  }
  componentWillUnmount() {
    location.reload();
  }
  render() {
    return (
      <Container>
        <div className="first-run-content">
          <h2>
            <FormattedMessage
              id="app.first_run.title"
              defaultMessage="Running first data fetch"
            />
          </h2>
          <Loading />
          <p>
            <FormattedMessage
              id="app.first_run.message"
              defaultMessage="Soon you will be able to continue using the platform."
            />
          </p>
        </div>
      </Container>
    );
  }
}

export default FirstRun;
