import React, { Component } from "react";
import { Accounts } from "meteor/accounts-base";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";
import styled from "styled-components";
import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";
import CountrySelect from "../components/CountrySelect.jsx";
import RegionSelect from "../components/RegionSelect.jsx";
import OrLine from "../components/OrLine.jsx";

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {}
    };
  }
  _handleSubmit = ev => {
    ev.preventDefault();
    const { formData } = this.state;
    if (!formData.name) {
      alertStore.add("You must set a name", "error");
      return;
    }
    if (!formData.email) {
      alertStore.add("You must set an email", "error");
      return;
    }
    if (!formData.password) {
      alertStore.add("You must set password", "error");
      return;
    }
    if (formData.password != formData.passwordRpt) {
      alertStore.add("Passwords do not match", "error");
      return;
    }
    Accounts.createUser(
      {
        name: formData.name,
        email: formData.email,
        country: formData.country,
        region: formData.region,
        password: formData.password
      },
      err => {
        if (err) {
          console.log(err);
          alertStore.add(err);
        }
        alertStore.add(null, "success");
      }
    );
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
    const { formData } = this.state;
    return (
      <Page.Content>
        <Form onSubmit={this._handleSubmit}>
          <Form.Field label="Name">
            <input type="text" name="name" onChange={this._handleChange} />
          </Form.Field>
          <Form.Field label="Email">
            <input type="email" name="email" onChange={this._handleChange} />
          </Form.Field>
          <Form.Field label="Country">
            <CountrySelect name="country" onChange={this._handleChange} />
          </Form.Field>
          {formData.country ? (
            <Form.Field label="Region">
              <RegionSelect
                country={formData.country}
                name="region"
                onChange={this._handleChange}
              />
            </Form.Field>
          ) : null}
          <Form.Field label="Password">
            <input
              type="password"
              name="password"
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label="Repeat password">
            <input
              type="password"
              name="passwordRpt"
              onChange={this._handleChange}
            />
          </Form.Field>
          <input type="submit" name="Register" />
        </Form>
      </Page.Content>
    );
  }
}

export default RegisterPage;
