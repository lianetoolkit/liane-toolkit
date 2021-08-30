import React, { Component } from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

const Container = styled.a`
  display: block;
  width: 100%;
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.5;
  cursor: pointer;
  padding: 1rem;
  font-size: 1.2em;
  outline: none;
  border: 0;
  text-align: center;
  display: block;
  background: #3b5998;
  color: #fff;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  margin: 0 0 3rem;
  .fa-facebook-square {
    margin-right: 1rem;
  }
  &:focus,
  &:hover {
    background: #333;
    color: #fff;
  }
`;

class FacebookButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  _facebookAuth = (ev) => {
    ev.preventDefault();
    const { invite, type } = this.props;
    let data = {
      requestPermissions: ["public_profile", "email"],
    };
    if (type == "campaigner") {
      data.requestPermissions = data.requestPermissions.concat([
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
      ]);
    }
    this.setState({ loading: true });
    Meteor.loginWithFacebook(data, (err) => {
      if (err) {
        this.setState({ loading: false });
        alertStore.add("Erro durante autenticação, tente novamente.", "error");
      } else {
        Meteor.call("users.exchangeFBToken", (err, data) => {
          this.setState({ loading: false });
          if (err) {
            alertStore.add(err);
          } else {
            if (invite) {
              Meteor.call("campaigns.applyInvitation", { invite }, (err) => {
                if (err) {
                  alertStore.add(err);
                  FlowRouter.go("App.dashboard");
                } else {
                  alertStore.add(null, "success");
                  FlowRouter.go("App.dashboard");
                  window.location.reload();
                }
              });
            } else if (type == "campaigner") {
              Meteor.call("users.setType", { type }, (err, res) => {
                if (err) {
                  alertStore.add(err);
                  this.setState({ loading: false });
                } else {
                  window.location.reload();
                }
              });
            } else {
              alertStore.add(null, "success");
              FlowRouter.go("App.dashboard");
            }
          }
        });
      }
    });
  };
  render() {
    const { onClick } = this.props;
    return (
      <Container
        className="facebook-button button"
        onClick={onClick || this._facebookAuth}
      >
        <FontAwesomeIcon icon={["fab", "facebook-square"]} />
        <FormattedMessage
          id="app.facebook_login"
          defaultMessage="Connect with Facebook"
        />
      </Container>
    );
  }
}

export default FacebookButton;
