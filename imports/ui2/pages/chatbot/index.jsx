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
import Actions from "./modules/Actions.jsx";
import ModuleInfo from "./modules/Info.jsx";
import ModuleProposals from "./modules/Proposals.jsx";
import ModuleAutoReply from "./modules/AutoReply.jsx";
import ModuleNotifications from "./modules/Notifications.jsx";
import ModuleRegistration from "./modules/Registration.jsx";

const Container = styled.div`
  /* max-width: 960px; */
  width: 100%;
  display: flex;
  section {
    &.disabled > * {
      opacity: 0.5;
    }
  }
`;

const CreateContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 1.2em;
  p {
    color: #999;
    font-style: italic;
  }
  .button {
    padding: 1rem 2rem;
  }
`;

class CreateChatbot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _handleClick = () => {
    const { campaign, onCreate } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call(
      "chatbot.activation",
      {
        campaignId: campaign._id,
        active: true
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        } else {
          onCreate && onCreate();
        }
      }
    );
  };
  render() {
    const { loading } = this.state;
    return (
      <CreateContainer>
        <p>O chatbot não está habilitado</p>
        <Button primary onClick={this._handleClick} disabled={loading}>
          Habilitar chatbot
        </Button>
      </CreateContainer>
    );
  }
}

class ChatbotPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      chatbot: {}
    };
  }
  componentDidMount() {
    this.fetch();
  }
  componentDidUpdate(prevProps, prevState) {
    const { campaign } = this.props;
    const { loading, chatbot } = this.state;
  }
  fetch = () => {
    const { campaign } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call("chatbot.get", { campaignId: campaign._id }, (err, res) => {
      if (err) {
        alertStore.add(err);
        this.setState({
          loading: false,
          chatbot: {}
        });
      } else {
        this.setState({
          loading: false,
          chatbot: res
        });
      }
    });
  };
  _handleChange = data => {
    this.setState({
      chatbot: data
    });
  };
  render() {
    const { module, campaign } = this.props;
    const { loading, chatbot } = this.state;
    if (loading) {
      return <Loading full />;
    }
    let content = { component: null };
    switch (module) {
      case "actions":
        content.component = Actions;
        break;
      case "info":
        content.component = ModuleInfo;
        break;
      case "proposals":
        content.component = ModuleProposals;
        break;
      case "auto_reply":
        content.component = ModuleAutoReply;
        break;
      case "notifications":
        content.component = ModuleNotifications;
        break;
      case "registration":
        content.component = ModuleRegistration;
        break;
      default:
        content.component = GeneralSettings;
    }
    return (
      <Container>
        {!loading && (!chatbot || !chatbot.config || !chatbot.config.idPage) ? (
          <CreateChatbot campaign={campaign} onCreate={this.fetch} />
        ) : (
          <>
            <ChatbotNav
              chatbot={campaign.facebookAccount.chatbot}
              module={module}
            />
            <content.component
              campaign={campaign}
              chatbot={campaign.facebookAccount.chatbot}
              onChange={this._handleChange}
            />
          </>
        )}
      </Container>
    );
  }
}

export default ChatbotPage;
