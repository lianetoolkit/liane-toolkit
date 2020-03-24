import React, { Component } from "react";
import { FormattedMessage, FormattedHTMLMessage } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { alertStore } from "../containers/Alerts.jsx";

const Container = styled.a`
  display: block;
  width: 100%;
  font-size: 0.8em;
  text-transform: uppercase;
  letter-spacing: 0.12rem;
  font-weight: normal;
  line-height: 1.5;
  cursor: pointer;
  padding: 1rem;
  font-size: 1.2em;
  font-family: "Unica One", monospace;
  outline: none;
  border: 0;
  text-align: center;
  display: block;
  background: #3b5998;
  color: #fff;
  box-shadow: 0 0 2rem rgba(0, 0, 0, 0.25);
  margin: 0 0 2rem;
  border-radius: 2.5rem;
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
      loading: false
    };
  }
  _facebookAuth = () => ev => {
    ev.preventDefault();
    const { invite } = this.props;
    this.setState({ loading: true });
    let data = {
      requestPermissions: ["public_profile", "email"]
    };
    Meteor.loginWithFacebook(data, err => {
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
              Meteor.call("campaigns.applyInvitation", { invite }, err => {
                if (err) {
                  alertStore.add(err);
                  FlowRouter.go("App.dashboard");
                } else {
                  alertStore.add(null, "success");
                  FlowRouter.go("App.dashboard");
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
    return (
      <Container
        className="facebook-button button"
        onClick={this._facebookAuth()}
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
