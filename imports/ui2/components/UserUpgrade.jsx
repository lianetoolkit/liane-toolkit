import React, { Component } from "react";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";

import { alertStore } from "../containers/Alerts.jsx";

import Button from "./Button.jsx";
import Loading from "./Loading.jsx";

const Container = styled.div`
  max-width: 500px;
  background: #fff;
  padding: 2rem;
  border-radius: 7px;
  border: 1px solid #ccc;
  margin: 4rem auto;
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    margin: 0 0 2rem;
  }
  .button {
    margin: 2rem 0 0;
    display: block;
  }
`;

export default class UserUpgrade extends Component {
  constructor(props) {
    super(props);
    this.state = { loading: false };
  }
  _handleClick = ev => {
    ev.preventDefault();
    const { onSuccess } = this.props;
    const permissions = [
      "public_profile",
      "email",
      "manage_pages",
      "publish_pages",
      "pages_show_list",
      "ads_management",
      "ads_read",
      "business_management",
      "pages_messaging",
      "pages_messaging_phone_number",
      "pages_messaging_subscriptions"
    ];
    this.setState({ loading: true });
    Facebook.requestCredential(
      {
        requestPermissions: permissions
      },
      token => {
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
      <Container>
        <h2>Upgrade your user!</h2>
        <p>
          You are currently not able to create a campaign. We must ask you to
          provide more Facebook permissions, required to enable all our
          features.
        </p>
        <Button primary onClick={this._handleClick}>
          Click here to become a campaigner!
        </Button>
      </Container>
    );
  }
}
