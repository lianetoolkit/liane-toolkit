import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set, defaultsDeep } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import Content from "/imports/ui2/components/Content.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Form from "/imports/ui2/components/Form.jsx";

import ChatbotNav from "./Nav.jsx";

import GeneralSettings from "./modules/General.jsx";
import ModuleInfo from "./modules/Info.jsx";

const Container = styled.div`
  /* max-width: 960px; */
  width: 100%;
  display: flex;
  header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    .chatbot-status {
      flex: 0 0 auto;
      margin: 0 2rem 0 0;
      font-weight: 600;
      p {
        margin: 0;
      }
    }
    .toggle-chatbot {
      flex: 1 1 100%;
      color: #999;
      text-decoration: none;
      font-size: 0.8em;
      line-height: 1;
      display: flex;
      align-items: center;
      > * {
        display: inline-block;
      }
      .fa-toggle-off,
      .fa-toggle-on {
        font-size: 2em;
        display: inline-block;
        margin-right: 1rem;
      }
      .fa-toggle-off {
        color: #ccc;
      }
      .fa-toggle-on {
        color: green;
      }
      &:hover {
        .fa-toggle-off {
          color: green;
        }
        .fa-toggle-on {
          color: #333;
        }
      }
    }
    .button {
      display: block;
      margin: 0;
      white-space: nowrap;
    }
  }
  section {
    &.disabled > * {
      opacity: 0.5;
    }
  }
`;

class ChatbotPage extends Component {
  render() {
    const { module, campaign } = this.props;
    return (
      <Container>
        <ChatbotNav module={module} />
        {!module ? <GeneralSettings campaign={campaign} /> : null}
        {module == "info" ? <ModuleInfo campaign={campaign} /> : null}
      </Container>
    );
  }
}

export default ChatbotPage;
