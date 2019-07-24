import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Button from "/imports/ui2/components/Button.jsx";
import Page from "/imports/ui2/components/Page.jsx";
import Content from "/imports/ui2/components/Content.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import Form from "/imports/ui2/components/Form.jsx";

const Container = styled.div`
  header {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ddd;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    .space {
      flex: 1 1 100%;
    }
    .chatbot-status {
      flex: 0 0 auto;
      margin: 0 2rem 0 0;
      font-weight: 600;
      p {
        margin: 0;
      }
    }
    .button {
      display: block;
      margin: 0;
      white-space: nowrap;
    }
  }
  .toggle-chatbot {
    flex: 1 1 100%;
    color: #666;
    text-decoration: none;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    background: #fff;
    padding: 0.75rem 1.5rem;
    border-radius: 1.625rem;
    border: 1px solid #ccc;
    justify-content: center;
    .fa-toggle-off,
    .fa-toggle-on {
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
  .button.delete {
    font-size: 0.8em;
    text-align: center;
  }
`;

export default class ChatbotGeneralSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _handleRemoveClick = () => {
    const { campaign } = this.props;
    if (confirm("Are you sure?")) {
      Meteor.call(
        "chatbot.remove",
        { campaignId: campaign._id },
        (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Removed", "success");
            FlowRouter.go("App.chatbot");
            window.location.reload();
          }
        }
      );
    }
  };
  _handleTestClick = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const test = get(campaign.facebookAccount, "chatbot.config.test");
    let msg = "Are you sure you'd like to make your chatbot public?";
    if (!test) {
      msg = "Are you sure you'd like to make your chatbot private for testing?";
    }
    if (confirm(msg)) {
      this.setState({
        loading: true
      });
      Meteor.call(
        "chatbot.testMode",
        {
          campaignId: campaign._id,
          test: !test
        },
        (err, res) => {
          this.setState({
            loading: false
          });
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Updated", "success");
          }
        }
      );
    }
  };
  _isTest = () => {
    const { campaign } = this.props;
    return get(campaign.facebookAccount, "chatbot.config.test");
  };
  _handleActivationClick = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const active = get(campaign.facebookAccount, "chatbot.config.active");
    let msg = "Are you sure you'd like to activate your chatbot?";
    if (active) {
      msg = "Are you sure you'd like to deactivate your chatbot?";
    }
    if (confirm(msg)) {
      this.setState({
        loading: true
      });
      Meteor.call(
        "chatbot.activation",
        {
          campaignId: campaign._id,
          active: !active
        },
        (err, res) => {
          this.setState({
            loading: false
          });
          if (err) {
            alertStore.add(err);
          } else {
            alertStore.add("Updated", "success");
          }
        }
      );
    }
  };
  _isActive = () => {
    const { campaign } = this.props;
    return get(campaign.facebookAccount, "chatbot.config.active");
  };
  render() {
    const { loading } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Container>
            {/* <header>
              <div className="chatbot-status">
                {this._isActive() ? (
                  <p>O chatbot está ativado</p>
                ) : (
                  <p>O chatbot está desativado</p>
                )}
              </div>
              <div className="space" />
              {this._isActive() ? <Button>Divulgar chatbot</Button> : null}
            </header> */}
            <a
              href="javascript:void(0);"
              className="toggle-chatbot"
              onClick={this._handleTestClick}
            >
              <FontAwesomeIcon
                icon={!this._isTest() ? "toggle-on" : "toggle-off"}
              />
              {this._isTest() ? (
                <span>Make public</span>
              ) : (
                <span>Make private</span>
              )}
            </a>
            <a
              href="javascript:void(0);"
              className="toggle-chatbot"
              onClick={this._handleActivationClick}
            >
              <FontAwesomeIcon
                icon={this._isActive() ? "toggle-on" : "toggle-off"}
              />
              {!this._isActive() ? (
                <span>Activate chatbot</span>
              ) : (
                <span>Deactivate chatbot</span>
              )}
            </a>
            <a
              className="button delete"
              href="javascript:void(0);"
              onClick={this._handleRemoveClick}
            >
              Delete chatbot and all its settings
            </a>
          </Container>
        </Form.Content>
      </Form>
    );
  }
}
