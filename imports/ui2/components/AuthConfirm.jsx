import React, { Component } from "react";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "../containers/Modal.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import Button, { ButtonGroup } from "../components/Button.jsx";

const AuthOptions = styled.div`
  .button-group {
    margin: 2rem 0;
    .button {
      padding-top: 1rem;
      padding-bottom: 1rem;
      border-color: rgba(0, 102, 51, 0.25);
      color: #999;
      &:hover,
      &:active,
      &:focus {
        background-color: rgba(0, 102, 51, 0.25);
        color: #fff;
      }
      &.active {
        background-color: #006633;
      }
      svg {
        margin-right: 0.5rem;
      }
    }
  }
  .button.primary {
    margin: 0;
    display: block;
  }
  p {
    font-size: 0.9em;
    color: #666;
  }
`;

class Confirm extends Component {
  constructor(props) {
    super(props);
    this.state = { type: "user" };
  }
  _handleTypeClick = type => ev => {
    ev.preventDefault();
    this.setState({ type });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { type } = this.state;
    let permissions = ["public_profile", "email"];
    switch (type) {
      case "campaigner":
        permissions = permissions.concat([
          "manage_pages",
          "publish_pages",
          "pages_show_list",
          "ads_management",
          "ads_read",
          "business_management",
          "pages_messaging",
          "pages_messaging_phone_number",
          "pages_messaging_subscriptions"
        ]);
        break;
      default:
    }
    Facebook.requestCredential(
      {
        requestPermissions: permissions
      },
      token => {
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call("users.setType", { type, token, secret }, (err, res) => {
          if (err) {
            alertStore.add(err);
          } else {
            modalStore.reset(true);
          }
        });
      }
    );
  };
  render() {
    const { type } = this.state;
    return (
      <AuthOptions>
        <p>Select below your account type</p>
        <Button.Group vertical toggler>
          <Button
            active={type == "user"}
            onClick={this._handleTypeClick("user")}
          >
            <FontAwesomeIcon icon="users" /> I'll participate in an existing
            campaign
          </Button>
          <Button
            active={type == "campaigner"}
            onClick={this._handleTypeClick("campaigner")}
          >
            <FontAwesomeIcon icon="star" /> I want to create a campaign
          </Button>
        </Button.Group>
        <p>
          Warning: To create a campaign you must have administrative access to
          the Facebook page you'd like to use.
        </p>
        <Button primary onClick={this._handleSubmit}>
          Choose account type
        </Button>
      </AuthOptions>
    );
  }
}

export default class AuthConfirm extends Component {
  componentDidMount() {
    const { user } = this.props;
    if (user && !user.type) {
      modalStore.setType("small");
      modalStore.set(<Confirm user={user} />, () => {
        // Keep from closing
        return false;
      });
    }
  }
  render() {
    return null;
  }
}
