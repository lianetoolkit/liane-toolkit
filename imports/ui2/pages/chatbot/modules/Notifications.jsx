import React, { Component } from "react";
import styled, { css } from "styled-components";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import ModuleStatus from "../ModuleStatus.jsx";

const Container = styled.div``;

export default class ChatbotNotificationsModule extends Component {
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
  componentDidMount() {
    this._fetchSubscription();
  }
  _fetchSubscription = () => {
    const { campaign } = this.props;
    Meteor.call(
      "facebook.accounts.hasSubsMessaging",
      { campaignId: campaign._id },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          console.log(res);
          this.setState({ status: res });
        }
      }
    );
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
          alertStore.add("Updated", "success");
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
              name="notifications"
              label="Send notifications"
              chatbot={chatbot}
              campaign={campaign}
              hideActivation={true}
              loading={false}
              onChange={this._handleChatbotChange}
            />
          </Container>
        </Form.Content>
        {/* <Form.Actions>
          <input
            type="submit"
            value="Save"
            onClick={this._handleSubmit}
          />
        </Form.Actions> */}
      </Form>
    );
  }
}
