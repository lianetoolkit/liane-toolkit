import React, { Component } from "react";
import { Accounts } from "meteor/accounts-base";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import styled from "styled-components";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { alertStore } from "../containers/Alerts.jsx";

import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";
import CountrySelect from "../components/CountrySelect.jsx";
import RegionSelect from "../components/RegionSelect.jsx";
import Loading from "../components/Loading.jsx";

const messages = defineMessages({
  phoneLabel: {
    id: "app.registration.phone_label",
    defaultMessage: "Phone",
  },
  countryLabel: {
    id: "app.registration.country_label",
    defaultMessage: "Country",
  },
  regionLabel: {
    id: "app.registration.region_label",
    defaultMessage: "Region",
  },
  roleLabel: {
    id: "app.registration.role_label",
    defaultMessage: "Role",
  },
  refLabel: {
    id: "app.registration.ref_label",
    defaultMessage: "How did you get here?",
  },
  updateProfileLabel: {
    id: "app.registration.updateProfileLabel",
    defaultMessage: "Finish registration",
  },
});

const alertsMessages = defineMessages({
  name: {
    id: "app.registration.alerts.name",
    defaultMessage: "You must set a name",
  },
  email: {
    id: "app.registration.alerts.email",
    defaultMessage: "You must set an email",
  },
  password: {
    id: "app.registration.alerts.password",
    defaultMessage: "You must set a password",
  },
  passwordMatch: {
    id: "app.registration.alerts.password_match",
    defaultMessage: "Passwords do not match",
  },
});

class RegisterProfilePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {},
    };
  }
  componentDidMount = () => {};
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { intl, campaignInvite, invite } = this.props;
    const { email, formData } = this.state;
    const language = ClientStorage.get("language");
    if (!formData.name) {
      alertStore.add(intl.formatMessage(alertsMessages.name), "error");
      return;
    }
    if (!email && !formData.email) {
      alertStore.add(intl.formatMessage(alertsMessages.email), "error");
      return;
    }
    if (!formData.password) {
      alertStore.add(intl.formatMessage(alertsMessages.password), "error");
      return;
    }
    if (formData.password != formData.passwordRpt) {
      alertStore.add(intl.formatMessage(alertsMessages.passwordMatch), "error");
      return;
    }
    const data = {
      name: formData.name,
      email: email || formData.email,
      country: formData.country,
      region: formData.region,
      password: formData.password,
    };
    if (language) {
      data.userLanguage = language;
    }
    if (!email) {
      data.email = formData.email;
    }
    if (campaignInvite) {
      data.invite = campaignInvite;
    }
    if (invite) {
      data.type = "campaigner";
    }
    this.setState({ loading: true });
    Accounts.createUser(data, (err) => {
      if (err) {
        alertStore.add(err);
        this.setState({ loading: false });
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
        [target.name]: target.value,
      },
    });
  };
  _filledForm = () => {
    const { agreed, formData } = this.state;
    return (
      agreed &&
      formData.name &&
      formData.country &&
      formData.region &&
      formData.password &&
      formData.passwordRpt
    );
  };
  _getRoleOptions = () => {
    return [
      {
        value: "candidate",
        label: "Mandatary/candidate",
      },
      {
        value: "coordinate",
        label: "Team Coordination",
      },
      {
        value: "advisor",
        label: "Political advisor",
      },
      {
        value: "mobilizer",
        label: "Mobilization Coordination",
      },
      {
        value: "marketing",
        label: "Marketing",
      },
      {
        value: "social_media",
        label: "Social media",
      },
      {
        value: "customer_service",
        label: "Customer service",
      },
      {
        value: "mobilizer",
        label: "Mobilizer",
      },
      {
        value: "volunteer",
        label: "Volunteer",
      },
      {
        value: "other",
        label: "Other",
      },
    ];
  };
  _getRefOptions = () => {
    return [
      {
        value: "search",
        label: "Search engines (Google, Bing, etc)",
      },
      {
        value: "facebook",
        label: "Facebook",
      },
      {
        value: "instagram",
        label: "Instagram",
      },
      {
        value: "twitter",
        label: "Twitter",
      },
      {
        value: "update",
        label: "Update Institute or some of its projects",
      },
      {
        value: "email",
        label: "Email",
      },
      {
        value: "friend",
        label: "Colleague or friend",
      },
      {
        value: "other",
        label: "Other",
      },
    ];
  };
  render() {
    const { intl, campaignInvite, invite } = this.props;
    const { loading, email, formData } = this.state;
    const roleOptions = this._getRoleOptions();
    const refOptions = this._getRefOptions();
    if (loading) return <Loading full />;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Page.Title>
            <FormattedMessage
              id="app.registration.profile.title"
              defaultMessage="Almost there..."
            />
          </Page.Title>
          <p>
            <FormattedMessage
              id="app.registration.profile.description"
              defaultMessage="We just need a few more information before you can start using Liane!"
            />
          </p>
          <Form.Field label={intl.formatMessage(messages.phoneLabel)}>
            <input type="text" name="phone" onChange={this._handleChange} />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.countryLabel)}>
            <CountrySelect name="country" onChange={this._handleChange} />
          </Form.Field>
          {formData.country ? (
            <Form.Field label={intl.formatMessage(messages.regionLabel)}>
              <RegionSelect
                country={formData.country}
                name="region"
                onChange={this._handleChange}
              />
            </Form.Field>
          ) : null}
          <Form.Field label={intl.formatMessage(messages.roleLabel)}>
            <Form.CheckboxGroup>
              {roleOptions.map((option) => (
                <label key={option.value}>
                  <input type="checkbox" value={option.value} />
                  {option.label}
                </label>
              ))}
            </Form.CheckboxGroup>
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.refLabel)}>
            <Form.CheckboxGroup>
              {refOptions.map((option) => (
                <label key={option.value}>
                  <input type="checkbox" value={option.value} />
                  {option.label}
                </label>
              ))}
            </Form.CheckboxGroup>
          </Form.Field>
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            disabled={!this._filledForm() || loading}
            value={intl.formatMessage(messages.updateProfileLabel)}
          />
        </Form.Actions>
      </Form>
    );
  }
}

RegisterProfilePage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(RegisterProfilePage);
