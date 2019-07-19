import React, { Component } from "react";
import styled, { css } from "styled-components";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import ToggleCheckbox from "/imports/ui2/components/ToggleCheckbox.jsx";

import ModuleStatus from "../ModuleStatus.jsx";

const Container = styled.div``;

export default class ChatbotVolunteerModule extends Component {
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
          <Container>
            <ModuleStatus
              name="registration"
              label="Registro de apoio"
              chatbot={chatbot}
              campaign={campaign}
              onChange={this._handleChatbotChange}
            />
            <ToggleCheckbox
              name="extra_info.registration.volunteer.active"
              checked={this.getValue(
                "extra_info.registration.volunteer.active"
              )}
              onChange={this._handleChange}
            >
              Registro de voluntários
            </ToggleCheckbox>
            {this.getValue("extra_info.registration.volunteer.active") ? (
              <Form.Field
                secondary
                label="Texto inicial para registro de voluntários"
              >
                <textarea
                  name="extra_info.registration.volunteer.text"
                  onChange={this._handleChange}
                  value={this.getValue(
                    "extra_info.registration.volunteer.text"
                  )}
                />
              </Form.Field>
            ) : null}
            <ToggleCheckbox
              name="extra_info.registration.donor.active"
              checked={this.getValue("extra_info.registration.donor.active")}
              onChange={this._handleChange}
            >
              Registro de doadores
            </ToggleCheckbox>
            {this.getValue("extra_info.registration.donor.active") ? (
              <Form.Field
                secondary
                label="Texto inicial para registro de doadores"
              >
                <textarea
                  name="extra_info.registration.donor.text"
                  onChange={this._handleChange}
                  value={this.getValue("extra_info.registration.donor.text")}
                />
              </Form.Field>
            ) : null}
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
