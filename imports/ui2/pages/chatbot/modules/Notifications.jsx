import React, { Component } from "react";
import moment from "moment";
import styled, { css } from "styled-components";
import ReactTooltip from "react-tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get, set } from "lodash";

import { alertStore } from "/imports/ui2/containers/Alerts.jsx";

import Form from "/imports/ui2/components/Form.jsx";
import Button from "/imports/ui2/components/Button.jsx";
import Loading from "/imports/ui2/components/Loading.jsx";

import ModuleStatus from "../ModuleStatus.jsx";

const Container = styled.div`
  p.warning {
    padding: 1rem 1.5rem;
    background: #f7f7f7;
    border: 1px solid #ccc;
    border-radius: 7px;
    color: #666;
  }
  p.tip {
    color: #999;
  }
`;

export default class ChatbotNotificationsModule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  // static getDerivedStateFromProps(props, state) {
  //   if (JSON.stringify(state.formData) != JSON.stringify(props.chatbot)) {
  //     return {
  //       formData: props.chatbot
  //     };
  //   }
  //   return null;
  // }
  componentDidMount() {
    this._fetchSubscription();
  }
  _fetchSubscription = () => {
    const { campaign } = this.props;
    this.setState({ loading: true });
    Meteor.call(
      "facebook.accounts.hasSubsMessaging",
      { campaignId: campaign._id },
      (err, res) => {
        this.setState({ loading: false });
        if (err) {
          alertStore.add(err);
        } else {
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
    if (!formData.message) {
      alertStore.add("You must type a message", "error");
      return;
    }
    if (this.isRateLimited()) {
      alertStore.add("You must wait until sending another message", "error");
      return;
    }
    this.setState({
      loading: true
    });
    Meteor.call(
      "chatbot.sendNotification",
      {
        campaignId: campaign._id,
        message: formData.message
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
          alertStore.add("Sent", "success");
        }
      }
    );
  };
  getLastDate = () => {
    const { campaign } = this.props;
    return campaign.facebookAccount.chatbot.lastNotificationDate;
  };
  isRateLimited = () => {
    const lastDate = this.getLastDate();
    return (
      lastDate &&
      moment(lastDate)
        .add(48, "hours")
        .isAfter(moment())
    );
  };
  sentDate = () => {
    const lastDate = this.getLastDate();
    return moment(lastDate).fromNow();
  };
  waitUntil = () => {
    const lastDate = this.getLastDate();
    return moment(lastDate)
      .add(48, "hours")
      .fromNow();
  };
  render() {
    const { campaign, chatbot } = this.props;
    const { loading, status, formData } = this.state;
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
              isActive={status == "APPROVED"}
              hideActivation={true}
              loading={false}
              onChange={this._handleChatbotChange}
            />
            {!status ? (
              <>
                <p>
                  Your page does not have the proper Facebook permissions to use
                  this feature.
                </p>
                <p>
                  <a
                    href={`https://www.facebook.com/${campaign.facebookAccount.facebookId}/settings/?tab=messenger_platform#advanced_settings`}
                    target="_blank"
                    rel="external"
                  >
                    Apply for Subscription Messaging
                  </a>{" "}
                  so you can send notifications to all people that have
                  interacted with you through Messenger.
                </p>
              </>
            ) : null}
            {status == "PENDING" ? (
              <p>
                Your Subscription Messaging request is still pending approval.
                Wait until it has been accepted to use this feature.
              </p>
            ) : null}
            {status == "APPROVED" ? (
              <>
                {this.isRateLimited() ? (
                  <p className="warning">
                    Last message sent <strong>{this.sentDate()}</strong>. You
                    will be able to send another message{" "}
                    <strong>{this.waitUntil()}</strong>.
                  </p>
                ) : null}
                <p>
                  Send a global message to all people that interacted with you
                  through Facebook Messenger.
                </p>
                <Form.Field label="Message">
                  <textarea
                    disabled={this.isRateLimited()}
                    onChange={this._handleChange}
                    name="message"
                    placeholder="Type a message..."
                  />
                </Form.Field>
                {!this.isRateLimited() ? (
                  <p className="tip">
                    <strong>Warning</strong>: You can only send one message
                    every 48 hours
                  </p>
                ) : null}
                <input
                  type="submit"
                  disabled={this.isRateLimited()}
                  value="Send message"
                  onClick={this._handleSubmit}
                />
              </>
            ) : null}
          </Container>
        </Form.Content>
        {/* <Form.Actions>
          <input type="submit" value="Save" onClick={this._handleSubmit} />
        </Form.Actions> */}
      </Form>
    );
  }
}
