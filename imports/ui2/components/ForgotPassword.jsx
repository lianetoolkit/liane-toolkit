import React, { Component } from "react";

import { Accounts } from "meteor/accounts-base";

import { alertStore } from "../containers/Alerts.jsx";
import { modalStore } from "../containers/Modal.jsx";

import Form from "./Form.jsx";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
      Accounts.forgotPassword({ email: formData.email }, err => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add(null, "success");
          modalStore.reset(true);
        }
      });
    }
  };
  render() {
    const { formData } = this.props;
    return (
      <Form onSubmit={this._handleSubmit}>
        <p>You'll receive a link to reset your password.</p>
        <Form.Field label="Email">
          <input type="email" name="email" onChange={this._handleChange} />
        </Form.Field>
        <input type="submit" value="Reset password" />
      </Form>
    );
  }
}

export default ForgotPassword;
