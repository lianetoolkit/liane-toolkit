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
    let msg = "Você tem certeza que deseja tornar o chatbot público?";
    if (!test) {
      msg = "Você tem certeza que deseja tornar o chatbot privado para testes?";
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
            alertStore.add("Atualizado", "success");
          }
        }
      );
    }
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
          alertStore.add("Atualizado", "success");
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
                  <p>O chatbot está público</p>
                ) : (
                  <p>O chatbot está em modo de testes</p>
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
                  <span>Tornar público</span>
                ) : (
                  <span>Tornar privado</span>
                )}
              </a>
              {!this._isTest() ? <Button>Divulgar chatbot</Button> : null}
            </header>
            <Form.Field label="Nome para apresentar candidatura">
              <input
                type="text"
                name="extra_info.candidate"
                value={this.getValue("extra_info.candidate")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Número da candidatura (se aplicável)">
              <input
                type="text"
                name="extra_info.candidate_number"
                value={this.getValue("extra_info.candidate_number")}
                onChange={this._handleChange}
                size="3"
              />
            </Form.Field>
            <Form.Field label="Apresentação">
              <textarea
                placeholder="Descreva brevemente sobre sua campanha"
                name="extra_info.campaign_presentation"
                value={this.getValue("extra_info.campaign_presentation")}
                onChange={this._handleChange}
              />
            </Form.Field>
          </Container>
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            value="Atualizar configurações"
            onClick={this._handleSubmit}
          />
        </Form.Actions>
      </Form>
    );
  }
}
