import React, { Component } from "react";
import styled, { css } from "styled-components";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import ModuleStatus from "../ModuleStatus.jsx";

export default class ChatbotInfoModule extends Component {
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
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    const { formData } = this.state;
    this.setState({
      loading: true
    });
    Meteor.call(
      "campaigns.chatbot.update",
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
          this._handleChatbotChange(res);
        }
      }
    );
  };
  getValue = path => {
    const { formData } = this.state;
    return get(formData, path);
  };
  _handleChatbotChange = data => {
    const { onChange } = this.props;
    if (onChange && typeof onChange == "function") {
      onChange(data);
    }
  };
  render() {
    const { campaign, chatbot } = this.props;
    const { loading, formData } = this.state;
    if (loading) {
      return <Loading full />;
    }
    return (
      <Form onSubmit={ev => ev.preventDefault()}>
        <Form.Content>
          <ModuleStatus
            name="info"
            label="Informações do candidato"
            chatbot={chatbot}
            campaign={campaign}
            onChange={this._handleChatbotChange}
          />
          <Form.Field label="Informação básica da candidatura">
            <textarea
              name="extra_info.info.description"
              onChange={this._handleChange}
              value={this.getValue("extra_info.info.description")}
            />
          </Form.Field>
          <label>
            <input
              type="checkbox"
              name="extra_info.info.biography.active"
              checked={this.getValue("extra_info.info.biography.active")}
              onChange={this._handleChange}
            />{" "}
            Habilitar biografia
          </label>
          {this.getValue("extra_info.info.biography.active") ? (
            <Form.Field label="Biografia">
              <textarea
                name="extra_info.info.biography.text"
                onChange={this._handleChange}
                value={this.getValue("extra_info.info.biography.text")}
              />
            </Form.Field>
          ) : null}
          <label>
            <input
              type="checkbox"
              name="extra_info.info.party.active"
              onChange={this._handleChange}
              checked={this.getValue("extra_info.info.party.active")}
            />{" "}
            Habilitar descrição do partido/grupo/coalisão
          </label>
          {this.getValue("extra_info.info.party.active") ? (
            <>
              <Form.Field label="Nome do partido/grupo/coalisão">
                <input
                  type="text"
                  name="extra_info.info.party.name"
                  onChange={this._handleChange}
                  value={this.getValue("extra_info.info.party.name")}
                />
              </Form.Field>
              <Form.Field label="Descrição">
                <textarea
                  name="extra_info.info.party.description"
                  onChange={this._handleChange}
                  value={this.getValue("extra_info.info.party.description")}
                />
              </Form.Field>
            </>
          ) : null}
          <label>
            <input
              type="checkbox"
              name="extra_info.info.more.active"
              onChange={this._handleChange}
              checked={this.getValue("extra_info.info.more.active")}
            />{" "}
            Habilitar "mais informações"
          </label>
          {this.getValue("extra_info.info.more.active") ? (
            <Form.Field label="Mais informações">
              <textarea
                name="extra_info.info.more.text"
                onChange={this._handleChange}
                value={this.getValue("extra_info.info.more.text")}
              />
            </Form.Field>
          ) : null}
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
