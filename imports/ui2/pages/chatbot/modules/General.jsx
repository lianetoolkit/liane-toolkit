import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";
import { modalStore } from "/imports/ui2/containers/Modal.jsx";

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
`;

const PublishContainer = styled.div`
  h3 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  p {
    margin: 0 0 0.5rem;
  }
  a.button.whatsapp {
    background: #25d366;
    color: #fff;
    margin: 0;
    display: block;
    text-align: center;
    svg {
      margin-right: 1rem;
      font-size: 1.2em;
    }
    &:hover,
    &:focus,
    &:active {
      background-color: #075e54;
    }
  }
`;

export default class ChatbotGeneralSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(state.formData) != JSON.stringify(props.chatbot)) {
      return {
        formData: props.chatbot
      };
    }
    return null;
  }
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
  _handlePublishClick = () => {
    const { campaign } = this.props;
    const config = get(campaign.facebookAccount, "chatbot.config");
    modalStore.setType("small");
    modalStore.set(
      <PublishContainer>
        <h3>Publish your chatbot</h3>
        <p>Link to your chatbot:</p>
        <input type="text" value={config.broadcast.url} disabled />
        <Button
          className="button whatsapp"
          href={config.broadcast.whatsapp}
          target="_blank"
          rel="external"
        >
          <FontAwesomeIcon icon={["fab", "whatsapp"]} /> Send using WhatsApp
        </Button>
      </PublishContainer>
    );
  };
  _isTest = () => {
    const { campaign } = this.props;
    return get(campaign.facebookAccount, "chatbot.config.test");
  };
  _isActive = () => {
    const { campaign } = this.props;
    return get(campaign.facebookAccount, "chatbot.config.active");
  };
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    let newFormData = { ...formData };
    set(
      newFormData,
      target.name,
      target.type == "checkbox" ? target.checked : target.value
    );
    this.setState({
      formData: newFormData
    });
  };
  getValue = path => {
    const { formData } = this.state;
    return get(formData, path);
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const { formData } = this.state;
    this.setState({
      loading: true
    });
    console.log(formData);
    Meteor.call(
      "chatbot.update",
      {
        campaignId: campaign._id,
        config: formData
      },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            formData: res.config
          });
          alertStore.add("Updated", "success");
        }
      }
    );
  };
  render() {
    const { loading, formData } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Container>
            <header>
              <div className="chatbot-status">
                {!this._isTest() ? (
                  <p>Chatbot is public</p>
                ) : (
                  <p>Chatbot is in test mode</p>
                )}
              </div>
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
              {!this._isTest() ? (
                <Button onClick={this._handlePublishClick}>
                  Publish chatbot
                </Button>
              ) : null}
            </header>
            <Form.Field label="Name to present candidate">
              <input
                type="text"
                name="extra_info.candidate"
                value={this.getValue("extra_info.candidate")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Candidate number (if applicable)">
              <input
                type="text"
                name="extra_info.candidate_number"
                value={this.getValue("extra_info.candidate_number")}
                onChange={this._handleChange}
                size="3"
              />
            </Form.Field>
            <Form.Field label="Presentation">
              <textarea
                placeholder="Briefly describe your campaign"
                name="extra_info.campaign_presentation"
                value={this.getValue("extra_info.campaign_presentation")}
                onChange={this._handleChange}
              />
            </Form.Field>
          </Container>
        </Form.Content>
        <Form.Actions>
          <input type="submit" value="Save" onClick={this._handleSubmit} />
        </Form.Actions>
      </Form>
    );
  }
}
