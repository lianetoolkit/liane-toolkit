import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClientStorage } from "meteor/ostrio:cstorage";

import Button from "./Button.jsx";

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: #f9c112;
  color: #000;
  font-weight: 600;
  text-align: center;
  padding: 0.75rem;
  font-size: 0.8em;
  z-index: 1000;
  svg {
    font-size: 0.8em;
    margin: 0 1rem;
    color: rgba(0, 0, 0, 0.5);
  }
  .button {
    font-size: 0.8em;
    padding: 0.25rem 0.5rem;
  }
  .close {
    float: right;
  }
`;

class InviteNotification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      closed: false
    };
  }
  _close = () => {
    this.setState({
      closed: true
    });
  };
  render() {
    const { invite } = this.props;
    const { closed } = this.state;
    const user = Meteor.user();
    if (invite && !closed) {
      return (
        <Container>
          <FontAwesomeIcon icon="star" />
          <FormattedMessage
            id="app.campaign.invite.text"
            defaultMessage="You have an active invite to create a new campaign!"
          />{" "}
          {user ? (
            <Button
              href={FlowRouter.path("App.campaign.new")}
              onClick={this._close}
            >
              <FormattedMessage
                id="app.campaign.invite.button_label"
                defaultMessage="Create campaign"
              />
            </Button>
          ) : (
            <FormattedMessage
              id="app.campaign.invite.register"
              defaultMessage="Sign in or register to claim your invitation."
            />
          )}
          <a
            href="#"
            className="close"
            onClick={ev => {
              ev.preventDefault();
              this._close();
            }}
          >
            <FontAwesomeIcon icon="times" />
          </a>
        </Container>
      );
    }
    return null;
  }
}

export default InviteNotification;
