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
import FacebookButton from "../components/FacebookButton.jsx";

class RegisterPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {}
    };
  }
  componentDidMount = () => {
    const { invite } = this.props;
    if (invite) {
      this.setState({ loading: true });
      Meteor.call("campaigns.getInviteInfo", { invite }, (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          this.setState({
            email: res.email
          });
          if (Meteor.userId()) {
            Meteor.call(
              "campaigns.applyInvitation",
              { invite },
              (err, { campaignId }) => {
                Session.set("campaignId", campaignId);
                FlowRouter.go("App.dashboard");
                window.location.reload();
              }
            );
          }
        }
        this.setState({
          loading: false
        });
      });
    } else if (Meteor.userId()) {
      FlowRouter.go("/");
    }
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    const { invite } = this.props;
    const { email, formData } = this.state;
    if (!formData.name) {
      alertStore.add("You must set a name", "error");
      return;
    }
    if (!email && !formData.email) {
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
    let data = {
      name: formData.name,
      email: email || formData.email,
      country: formData.country,
      region: formData.region,
      password: formData.password
    };
    if (!email) {
      data.email = formData.email;
    }
    if (invite) {
      data.invite = invite;
    }
    Accounts.createUser(data, err => {
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
  _filledForm = () => {
    const { formData } = this.state;
    return (
      formData.name &&
      formData.country &&
      formData.region &&
      formData.password &&
      formData.passwordRpt
    );
  };
  render() {
    const { invite } = this.props;
    const { loading, email, formData } = this.state;
    if (loading) return null;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Page.Title>New account</Page.Title>
          <FacebookButton invite={invite} />
          <OrLine bgColor="#f7f7f7">Or fill the form below</OrLine>
          <Form.Field label="Name">
            <input type="text" name="name" onChange={this._handleChange} />
          </Form.Field>
          {!email ? (
            <Form.Field label="Email">
              <input type="email" name="email" onChange={this._handleChange} />
            </Form.Field>
          ) : null}
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
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            disabled={!this._filledForm() || loading}
            value="Create account"
          />
        </Form.Actions>
      </Form>
    );
  }
}

export default RegisterPage;
