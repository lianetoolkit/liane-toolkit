import React, { Component } from "react";
import { Accounts } from "meteor/accounts-base";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";

class ResetPasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { token } = this.props;
    const { formData } = this.state;
    if (!formData.password) {
      alertStore.add("You must set password", "error");
      return;
    }
    if (formData.password != formData.passwordRpt) {
      alertStore.add("Passwords do not match", "error");
      return;
    }
    Accounts.resetPassword(token, formData.password, err => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        FlowRouter.go("App.dashboard");
      }
    });
  };
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  render() {
    return (
      <Page.Content>
        <Page.Title>Reset password</Page.Title>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label="New password">
            <input
              type="password"
              name="password"
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label="Repeat new password">
            <input
              type="password"
              name="passwordRpt"
              onChange={this._handleChange}
            />
          </Form.Field>
          <input type="submit" name="Reset password" />
        </Form>
      </Page.Content>
    );
  }
}

export default ResetPasswordPage;
