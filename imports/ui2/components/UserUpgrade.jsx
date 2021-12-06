import React, { Component } from "react";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";
import { FormattedMessage } from "react-intl";

import { alertStore } from "../containers/Alerts.jsx";

import Button from "./Button.jsx";
import FacebookButton from "./FacebookButton.jsx";
import Loading from "./Loading.jsx";
import Page from "./Page.jsx";

export default class UserUpgrade extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  _handleClick = (ev) => {
    ev.preventDefault();
    const { onSuccess } = this.props;
    const permissions = [
      "public_profile",
      "email",
      "pages_read_engagement",
      "pages_read_user_content",
      "pages_manage_posts",
      "pages_manage_engagement",
      "pages_manage_metadata",
      "pages_show_list",
      "pages_messaging",
      "pages_messaging_phone_number",
      "pages_messaging_subscriptions",
      "instagram_basic",
      "instagram_manage_comments",
    ];
    this.setState({ loading: true });
    Facebook.requestCredential(
      {
        requestPermissions: permissions,
      },
      (token) => {
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call(
          "users.setType",
          { type: "campaigner", token, secret },
          (err, res) => {
            if (err) {
              alertStore.add(err);
            } else {
              onSuccess && onSuccess(res);
            }
            this.setState({ loading: false });
          }
        );
      }
    );
  };
  render() {
    const { loading } = this.state;
    if (loading) return <Loading />;
    return (
      <Page.Boxed>
        <div className="info">
          <h2>
            <FormattedMessage
              id="app.user_upgrade.title"
              defaultMessage="Upgrade your user!"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.user_upgrade.text"
              defaultMessage="You are currently not able to create a campaign. We must ask you to connect with Facebook and provide more user permissions, required to enable all our features."
            />
          </p>
        </div>
        <FacebookButton onClick={this._handleClick} />
      </Page.Boxed>
    );
  }
}
