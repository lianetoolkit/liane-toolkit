import React, { Component } from "react";
import styled, { css } from "styled-components";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";
import ToggleCheckbox from "/imports/ui2/components/ToggleCheckbox.jsx";

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
          this._handleChatbotChange(res.config);
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
            label="Candidate information"
            chatbot={chatbot}
            campaign={campaign}
            onChange={this._handleChatbotChange}
          />
          <Form.Field label="Basic information about the candidate">
            <textarea
              name="extra_info.info.description"
              onChange={this._handleChange}
              value={this.getValue("extra_info.info.description")}
            />
          </Form.Field>
          <ToggleCheckbox
            name="extra_info.info.biography.active"
            checked={this.getValue("extra_info.info.biography.active")}
            onChange={this._handleChange}
          >
            Enable biography
          </ToggleCheckbox>
          {this.getValue("extra_info.info.biography.active") ? (
            <Form.Field secondary label="Biography">
              <textarea
                name="extra_info.info.biography.text"
                onChange={this._handleChange}
                value={this.getValue("extra_info.info.biography.text")}
              />
            </Form.Field>
          ) : null}
          <ToggleCheckbox
            name="extra_info.info.party.active"
            onChange={this._handleChange}
            checked={this.getValue("extra_info.info.party.active")}
          >
            Enable description of party/group/coalition
          </ToggleCheckbox>
          {this.getValue("extra_info.info.party.active") ? (
            <>
              <Form.Field secondary label="Name of the party/group/coalition">
                <input
                  type="text"
                  name="extra_info.info.party.name"
                  onChange={this._handleChange}
                  value={this.getValue("extra_info.info.party.name")}
                />
              </Form.Field>
              <Form.Field secondary label="Description">
                <textarea
                  name="extra_info.info.party.description"
                  onChange={this._handleChange}
                  value={this.getValue("extra_info.info.party.description")}
                />
              </Form.Field>
            </>
          ) : null}
          <ToggleCheckbox
            name="extra_info.info.more.active"
            onChange={this._handleChange}
            checked={this.getValue("extra_info.info.more.active")}
          >
            Enable "more information"
          </ToggleCheckbox>
          {this.getValue("extra_info.info.more.active") ? (
            <Form.Field secondary label="More information">
              <textarea
                name="extra_info.info.more.text"
                onChange={this._handleChange}
                value={this.getValue("extra_info.info.more.text")}
              />
            </Form.Field>
          ) : null}
        </Form.Content>
        <Form.Actions>
          <input type="submit" value="Save" onClick={this._handleSubmit} />
        </Form.Actions>
      </Form>
    );
  }
}
