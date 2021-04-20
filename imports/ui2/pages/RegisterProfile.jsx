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

const rolesLabels = defineMessages({
  candidate: {
    id: "app.registration.roles.candidate",
    defaultMessage: "Mandatary/candidate",
  },
  team_coord: {
    id: "app.registration.roles.team_coord",
    defaultMessage: "Team Coordination",
  },
  advisor: {
    id: "app.registration.roles.advisor",
    defaultMessage: "Political advisor",
  },
  mobilization_coord: {
    id: "app.registration.roles.mobilization_coord",
    defaultMessage: "Mobilization Coordination",
  },
  marketing: {
    id: "app.registration.roles.marketing",
    defaultMessage: "Marketing",
  },
  social_media: {
    id: "app.registration.roles.social_media",
    defaultMessage: "Social media",
  },
  customer_service: {
    id: "app.registration.roles.customer_service",
    defaultMessage: "Customer service",
  },
  mobilizer: {
    id: "app.registration.roles.mobilizer",
    defaultMessage: "Mobilizer",
  },
  volunteer: {
    id: "app.registration.roles.volunteer",
    defaultMessage: "Volunteer",
  },
  other: {
    id: "app.registration.roles.other",
    defaultMessage: "Other",
  },
});

const refsLabels = defineMessages({
  search: {
    id: "app.registration.refs.search",
    defaultMessage: "Search engines (Google, Bing, etc)",
  },
  facebook: {
    id: "app.registration.refs.facebook",
    defaultMessage: "Facebook",
  },
  instagram: {
    id: "app.registration.refs.instagram",
    defaultMessage: "Instagram",
  },
  twitter: {
    id: "app.registration.refs.twitter",
    defaultMessage: "Twitter",
  },
  update: {
    id: "app.registration.refs.update",
    defaultMessage: "Update Institute or some of its projects",
  },
  email: {
    id: "app.registration.refs.email",
    defaultMessage: "Email",
  },
  friend: {
    id: "app.registration.refs.friend",
    defaultMessage: "Colleague or friend",
  },
  other: {
    id: "app.registration.refs.other",
    defaultMessage: "Other",
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
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { formData } = this.state;
    Meteor.call("users.updateProfile", formData, (err, res) => {
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
        [target.name]: target.value,
      },
    });
  };
  _filledForm = () => {
    const { formData } = this.state;
    return (
      formData.country &&
      formData.region &&
      formData.campaignRole &&
      formData.ref
    );
  };
  _getRoleOptions = () => {
    const { intl } = this.props;
    let roles = [
      "candidate",
      "team_coord",
      "advisor",
      "mobilization_coord",
      "marketing",
      "social_media",
      "customer_service",
      "mobilizer",
      "volunteer",
      "other",
    ];
    return roles.map((value) => {
      return {
        value,
        label: intl.formatMessage(rolesLabels[value]),
      };
    });
  };
  _getRefOptions = () => {
    const { intl } = this.props;
    let refs = [
      "search",
      "facebook",
      "instagram",
      "twitter",
      "update",
      "email",
      "friend",
      "other",
    ];
    return refs.map((value) => {
      return {
        value,
        label: intl.formatMessage(refsLabels[value]),
      };
    });
  };
  _isChecked = (key, val) => {
    const set = this.state.formData[key];
    if (this.state.formData[key]) {
      return (
        this.state.formData[key] == val ||
        this.state.formData[key].indexOf(val) !== -1
      );
    }
    return false;
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
              defaultMessage="We just need a few more information before you can continue using Liane!"
            />
          </p>
          <Form.Field label={intl.formatMessage(messages.phoneLabel)} optional>
            <input type="text" name="phone" onChange={this._handleChange} />
          </Form.Field>
          <Form.Field
            label={intl.formatMessage(messages.countryLabel)}
            required
          >
            <CountrySelect name="country" onChange={this._handleChange} />
          </Form.Field>
          {formData.country ? (
            <Form.Field
              label={intl.formatMessage(messages.regionLabel)}
              required
            >
              <RegionSelect
                country={formData.country}
                name="region"
                onChange={this._handleChange}
              />
            </Form.Field>
          ) : null}
          <Form.Field label={intl.formatMessage(messages.roleLabel)} required>
            <Form.CheckboxGroup>
              {roleOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    value={option.value}
                    name="campaignRole"
                    onChange={this._handleChange}
                    isChecked={this._isChecked("role", option.value)}
                  />
                  {option.label}
                </label>
              ))}
            </Form.CheckboxGroup>
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.refLabel)} required>
            <Form.CheckboxGroup>
              {refOptions.map((option) => (
                <label key={option.value}>
                  <input
                    type="radio"
                    value={option.value}
                    name="ref"
                    onChange={this._handleChange}
                    isChecked={this._isChecked("ref", option.value)}
                  />
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
