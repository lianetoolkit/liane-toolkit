import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { OAuth } from "meteor/oauth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { modalStore } from "../containers/Modal.jsx";
import { alertStore } from "../containers/Alerts.jsx";
import Button, { ButtonGroup } from "../components/Button.jsx";
import Form from "../components/Form.jsx";
import Loading from "../components/Loading.jsx";

const AuthOptions = styled.div`
  .button-group {
    margin: 2rem 0;
    .button {
      padding-top: 1rem;
      padding-bottom: 1rem;
      border-color: rgba(51, 0, 102, 0.25);
      color: rgba(0, 0, 0, 0.5);
      &:hover,
      &:active,
      &:focus {
        background-color: rgba(51, 0, 102, 0.25);
        color: #fff;
      }
      &.active {
        background-color: #306;
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
    if (type == "campaigner") {
      Facebook.requestCredential(
        {
          requestPermissions: [
            "public_profile",
            "email",
            "manage_pages",
            "publish_pages",
            "pages_show_list",
            // "ads_management",
            // "ads_read",
            // "business_management",
            "pages_messaging",
            "pages_messaging_phone_number",
            "pages_messaging_subscriptions"
          ]
        },
        token => {
          if (token) {
            const secret = OAuth._retrieveCredentialSecret(token) || null;
            Meteor.call(
              "users.setType",
              { type, token, secret },
              (err, res) => {
                if (err) {
                  alertStore.add(err);
                } else {
                  modalStore.reset(true);
                }
              }
            );
          }
        }
      );
    } else {
      Meteor.call("users.setType", { type }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          modalStore.reset(true);
        }
      });
    }
  };
  render() {
    const { type } = this.state;
    return (
      <AuthOptions>
        <p>
          <FormattedMessage
            id="app.account_select.select_label"
            defaultMessage="Select below your account type"
          />
        </p>
        <Button.Group vertical toggler>
          <Button
            active={type == "user"}
            onClick={this._handleTypeClick("user")}
          >
            <FontAwesomeIcon icon="users" />{" "}
            <FormattedMessage
              id="app.account_select.select_option_user"
              defaultMessage="I'll participate in an existing campaign"
            />
          </Button>
          <Button
            active={type == "campaigner"}
            onClick={this._handleTypeClick("campaigner")}
          >
            <FontAwesomeIcon icon="star" />{" "}
            <FormattedMessage
              id="app.account_select.select_option_campaigner"
              defaultMessage="I want to create a campaign"
            />
          </Button>
        </Button.Group>
        <p>
          <FormattedMessage
            id="app.account_select.warning"
            defaultMessage="Warning: To create a campaign you must have administrative access to the Facebook page you'd like to use."
          />
        </p>
        <Button primary onClick={this._handleSubmit}>
          <FormattedMessage
            id="app.account_select.submit"
            defaultMessage="Choose account type"
          />
        </Button>
      </AuthOptions>
    );
  }
}

const EmailConfirmContainer = styled.div`
  form {
    box-sizing: border-box;
    font-size: 0.8em;
    border-radius: 7px;
    padding: 1rem;
    background: #f7f7f7;
    margin-top: 2rem;
    color: #666;
  }
  code {
    display: block;
    background: #f7f7f7;
    font-size: 0.9em;
    text-align: center;
    padding: 1rem;
    color: #666;
  }
  .small {
    font-size: 0.8em;
    color: #999;
  }
  .button {
    margin: 0;
    display: block;
    width: 100%;
  }
`;

class EmailConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  _handleChange = ({ target }) => {
    const { formData } = this.state;
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    this.setState({ loading: true });
    Meteor.call("users.updateEmail", { email: formData.email }, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
      }
      this.setState({ loading: false });
    });
  };
  _handleResendClick = ev => {
    ev.preventDefault();
    this.setState({ loading: true });
    Meteor.call("users.sendVerificationEmail", (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
      }
      this.setState({ loading: false });
    });
  };
  render() {
    const { loading } = this.state;
    const user = Meteor.user();
    if (loading) return <Loading />;
    return (
      <EmailConfirmContainer>
        <p>To continue using Liane, you must verify your email:</p>
        {user.emails.length ? (
          <>
            <p>
              <code>{user.emails[0].address}</code>
            </p>
            <p>Check your mail and click the link we sent you!</p>
            <Button primary onClick={this._handleResendClick}>
              Resend verification link
            </Button>
          </>
        ) : null}
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label="Not working? Use a different email address:">
            <input type="email" name="email" onChange={this._handleChange} />
          </Form.Field>
          <input
            className="secondary"
            type="submit"
            value="Send new verification link"
          />
        </Form>
      </EmailConfirmContainer>
    );
  }
}

export default class AuthConfirm extends Component {
  componentDidUpdate(prevProps, prevState) {
    const { user } = this.props;
    if (user && user.type && user.emails.length && user.emails[0].verified) {
      modalStore.reset(true);
    }
  }
  componentDidMount() {
    const { user } = this.props;
    if (user && !user.type) {
      modalStore.setType("small");
      modalStore.set(<Confirm user={user} />, () => {
        // Keep from closing
        return false;
      });
    } else if (user && !user.emails.find(e => e.verified == true)) {
      modalStore.setType("small");
      modalStore.setTitle("Email not verified");
      modalStore.set(<EmailConfirm />, () => {
        return false;
      });
    }
  }
  render() {
    return null;
  }
}
