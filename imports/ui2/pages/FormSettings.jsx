import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import { get, set } from "lodash";

import { alertStore } from "../containers/Alerts.jsx";

import Select from "react-select";

import Page from "../components/Page.jsx";
import Form from "../components/Form.jsx";
import FormEmbed from "../components/FormEmbed.jsx";
import PersonFormInfo from "../components/PersonFormInfo.jsx";
import SkillsConfig from "../components/SkillsConfig.jsx";

import { languages } from "/locales";

const messages = defineMessages({
  urlPathLabel: {
    id: "app.form_settings.form_url_path_label",
    defaultMessage: "Set form url path",
  },
  urlPathPlaceholder: {
    id: "app.form_settings.form_url_path_placeholder",
    defaultMessage: "MyCampaign",
  },
  formLanguageLabel: {
    id: "app.form_settings.form_language_label",
    defaultMessage: "Form language",
  },
  defaultLanguageLabel: {
    id: "app.form_settings.form_default_language_Label",
    defaultMessage: "Default (browser language)",
  },
  formTitleLabel: {
    id: "app.form_settings.form_title_label",
    defaultMessage: "Form title",
  },
  formPresentationLabel: {
    id: "app.form_settings.form_presentation_label",
    defaultMessage: "Form presentation text",
  },
  formThanksLabel: {
    id: "app.form_settings.form_thanks_label",
    defaultMessage: "After form submission text",
  },
  donationLabel: {
    id: "app.form_settings.form_donation_label",
    defaultMessage: "Donation page URL",
  },
  redirectLabel: {
    id: "app.form_settings.form_redirect_label",
    defaultMessage: "Default redirect URL",
  },
  skillsLabel: {
    id: "app.form_settings.form_skills_label",
    defaultMessage: "Desired skills",
  },
  saveLabel: {
    id: "app.form_settings.save",
    defaultMessage: "Save",
  },
});

class FormSettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        campaignId: "",
        slug: "",
        crm: {},
      },
    };
  }
  static getDerivedStateFromProps({ campaign }, { formData }) {
    if (!campaign) {
      return {
        formData: {
          campaignId: "",
          slug: "",
          crm: {},
        },
      };
    } else if (campaign._id !== formData.campaignId) {
      return {
        formData: {
          campaignId: campaign._id,
          slug: campaign.forms ? campaign.forms.slug : "",
          crm: campaign.forms ? campaign.forms.crm : {},
          skills: campaign.forms ? campaign.forms.skills : null,
        },
      };
    }
    return null;
  }
  _filledForm = () => {
    const { formData } = this.state;
    return formData.campaignId;
  };
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      Meteor.call("campaigns.formUpdate", formData, (err, data) => {
        if (!err) {
          alertStore.add("Updated", "success");
        } else {
          alertStore.add(err);
        }
      });
    }
  };
  getValue = (key) => {
    const { formData } = this.state;
    return get(formData, key);
  };
  _getFormLanguageOptions = () => {
    const { intl } = this.props;
    return [
      {
        label: intl.formatMessage(messages.defaultLanguageLabel),
        value: "",
      },
    ].concat(
      Object.keys(languages).map((key) => {
        return {
          label: languages[key],
          value: key,
        };
      })
    );
  };
  _getFormLanguageValue = () => {
    const { formData } = this.state;
    let key = get(formData, "crm.language");
    if (key) {
      return {
        label: languages[key],
        value: key,
      };
    }
    return null;
  };
  render() {
    const { intl, campaign } = this.props;
    const { formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Page.Title>
            <FormattedMessage
              id="app.form_settings.form_title"
              defaultMessage="Form"
            />
          </Page.Title>
          <p>
            <FormattedMessage
              id="app.form_settings.form_settings_description"
              defaultMessage="Use the form to invite your audience to your campaign! Besides the embed method below, there's also an exclusive link for each person in your directory, improving data integration."
            />
          </p>
          <h2>
            <FormattedMessage
              id="app.form_settings.embed_title"
              defaultMessage="Embed methods"
            />
          </h2>
          <FormEmbed campaign={campaign} />
          <hr />
          <h2>
            <FormattedMessage
              id="app.form_settings.settings_title"
              defaultMessage="Form settings"
            />
          </h2>
          <Form.Field
            label={intl.formatMessage(messages.urlPathLabel)}
            prefix={FlowRouter.url("")}
            description={
              <FormattedMessage
                id="app.form_settings.form_url_path_description"
                defaultMessage="This will only be available for the person exclusive form."
              />
            }
          >
            <input
              type="text"
              placeholder={intl.formatMessage(messages.urlPathPlaceholder)}
              name="slug"
              value={this.getValue("slug")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.formLanguageLabel)}>
            <Select
              classNamePrefix="select-search"
              cacheOptions
              isSearchable={true}
              placeholder={intl.formatMessage(messages.defaultLanguageLabel)}
              options={this._getFormLanguageOptions()}
              onChange={(selected) => {
                this._handleChange({
                  target: {
                    name: "crm.language",
                    value: selected.value,
                  },
                });
              }}
              name="crm.language"
              value={this._getFormLanguageValue()}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.formTitleLabel)}>
            <input
              type="text"
              name="crm.header"
              value={this.getValue("crm.header")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field
            label={intl.formatMessage(messages.formPresentationLabel)}
          >
            <textarea
              name="crm.text"
              value={this.getValue("crm.text")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field label={intl.formatMessage(messages.formThanksLabel)}>
            <textarea
              name="crm.thanks"
              value={this.getValue("crm.thanks")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field
            label={intl.formatMessage(messages.donationLabel)}
            description={
              <FormattedMessage
                id="app.form_settings.form_donation_description"
                defaultMessage="By filling this URL field the form will provide a donation checkbox which, if selected, will redirect them to the donation page after submission."
              />
            }
          >
            <input
              type="text"
              name="crm.donation"
              value={this.getValue("crm.donation")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field
            label={intl.formatMessage(messages.redirectLabel)}
            description={
              <FormattedMessage
                id="app.form_settings.form_redirect_description"
                defaultMessage="URL for default redirection after form submission. This will be used if no donation URL is provided or the user does not select the donation checkbox. If no URL is provided, it will be redirected to your Facebook page."
              />
            }
          >
            <input
              type="text"
              name="crm.redirect"
              placeholder={`https://facebook.com/${campaign.facebookAccount.facebookId}`}
              value={this.getValue("crm.redirect")}
              onChange={this._handleChange}
            />
          </Form.Field>
          <Form.Field
            label={intl.formatMessage(messages.skillsLabel)}
            description={
              <FormattedMessage
                id="app.form_settings.form_skills_description"
                defaultMessage="Customize the desired volunteer skills to appear in your form"
              />
            }
          >
            <SkillsConfig
              name="skills"
              value={this.getValue("skills")}
              onChange={this._handleChange}
            />
          </Form.Field>
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            disabled={!this._filledForm()}
            value={intl.formatMessage(messages.saveLabel)}
          />
        </Form.Actions>
      </Form>
    );
  }
}

FormSettingsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(FormSettingsPage);
