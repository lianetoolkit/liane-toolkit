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
import Loading from "../components/Loading.jsx";

const messages = defineMessages({
  passwordLabel: {
    id: "app.reset_password.password_label",
    defaultMessage: "New password"
  },
  passwordRptLabel: {
    id: "app.reset_password.password_rpt_label",
    defaultMessage: "Repeat new password"
  },
  submitLabel: {
    id: "app.reset_password.submit_label",
    defaultMessage: "Reset password"
  }
});

const alertsMessages = defineMessages({
  pwdDoNotMatch: {
    id: "app.reset_password.alerts.pwd_do_not_match",
    defaultMessage: "Passwords do not match"
  },
  notDefined: {
    id: "app.reset_password.alerts.not_defined",
    defaultMessage: "You must set a password"
  }
});

class ResetPasswordPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { intl, token } = this.props;
    const { formData } = this.state;
    if (!formData.password) {
      alertStore.add(intl.formatMessage(alertsMessages.notDefined), "error");
      return;
    }
    if (formData.password != formData.passwordRpt) {
      alertStore.add(intl.formatMessage(alertsMessages.pwdDoNotMatch), "error");
      return;
    }
    this.setState({ loading: true });
    Accounts.resetPassword(token, formData.password, err => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(null, "success");
        FlowRouter.go("App.dashboard");
      }
      this.setState({ loading: false });
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
    const { intl } = this.props;
    const { loading } = this.state;
    if (loading) return <Loading />;
    return (
      <Page.Content>
        <Page.Title>
          <FormattedMessage
            id="app.reset_password.title"
            defaultMessage="Reset password"
          />
        </Page.Title>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label={intl.formatMessage(messages.passwordLabel)}>
            <input
              type="password"
              name="password"
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.passwordRptLabel)}>
            <input
              type="password"
              name="passwordRpt"
              onChange={this._handleChange}
            />
          </Form.Field>
          <input
            type="submit"
            value={intl.formatMessage(messages.submitLabel)}
          />
        </Form>
      </Page.Content>
    );
  }
}

ResetPasswordPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(ResetPasswordPage);
