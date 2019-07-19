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
  _handleActivationClick = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const active = get(campaign.facebookAccount, "chatbot.active");
    let msg = "Você tem certeza que deseja ativar o chatbot?";
    if (active) {
      msg = "Você tem certeza que deseja remover o chatbot?";
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
            this.setState({
              formData: res
            });
            alertStore.add("Atualizado", "success");
          }
        }
      );
    }
  };
  _isActive = () => {
    return this.state.formData && this.state.formData.active;
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
            formData: res
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
          <header>
            <div className="chatbot-status">
              {this._isActive() ? (
                <p>O chatbot está ativado</p>
              ) : (
                <p>O chatbot está desativado</p>
              )}
            </div>
            <a
              href="javascript:void(0);"
              className="toggle-chatbot"
              onClick={this._handleActivationClick}
            >
              <FontAwesomeIcon
                icon={this._isActive() ? "toggle-on" : "toggle-off"}
              />
              {!this._isActive() ? (
                <span>Ativar chatbot</span>
              ) : (
                <span>Desativar chatbot</span>
              )}
            </a>
            {this._isActive() ? <Button>Divulgar chatbot</Button> : null}
          </header>
          <Form.Field label="Nome para apresentar candidatura">
            <input
              type="text"
              name="extra_info.candidate"
              value={this.getValue("extra_info.candidate")}
              disabled={!this._isActive()}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label="Número da candidatura (se aplicável)">
            <input
              type="text"
              name="extra_info.candidate_number"
              value={this.getValue("extra_info.candidate_number")}
              disabled={!this._isActive()}
              onChange={this._handleChange}
              size="3"
            />
          </Form.Field>
          <Form.Field label="Apresentação">
            <textarea
              placeholder="Descreva brevemente sobre sua campanha"
              name="extra_info.campaign_presentation"
              value={this.getValue("extra_info.campaign_presentation")}
              disabled={!this._isActive()}
              onChange={this._handleChange}
            />
          </Form.Field>
          {/* <label>
            <input
              type="checkbox"
              name="text_response"
              checked={this.getValue("text_response")}
              disabled={!this._isActive()}
              onChange={this._handleChange}
            />{" "}
            Ativar em mensagem inicial
          </label> */}
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
