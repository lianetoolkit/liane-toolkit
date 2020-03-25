import React, { Component } from "react";

import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";

import { Accounts } from "meteor/accounts-base";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Form from "./Form.jsx";
import Loading from "./Loading.jsx";

const messages = defineMessages({
  emailLabel: {
    id: "app.auth.email_label",
    defaultMessage: "Email"
  },
  resetPasswordLabel: {
    id: "app.auth.reset_password_label",
    defaultMessage: "Reset password"
  }
});

class ForgotPassword extends Component {
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
        ...formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    if (formData.email) {
      this.setState({ loading: true });
      Accounts.forgotPassword({ email: formData.email }, err => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(null, "success");
          modalStore.reset(true);
        }
        this.setState({ loading: false });
      });
    }
  };
  render() {
    const { intl } = this.props;
    const { loading } = this.state;
    if (loading) return <Loading />;
    return (
      <Form onSubmit={this._handleSubmit}>
        <p>
          <FormattedMessage
            id="app.auth.forgot_password_text"
            defaultMessage="You'll receive a link to reset your password."
          />
        </p>
        <Form.Field label={intl.formatMessage(messages.emailLabel)}>
          <input type="email" name="email" onChange={this._handleChange} />
        </Form.Field>
        <input
          type="submit"
          value={intl.formatMessage(messages.resetPasswordLabel)}
        />
      </Form>
    );
  }
}

ForgotPassword.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(ForgotPassword);
