import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage
} from "react-intl";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";

import Select from "react-select";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";

import { languages } from "/locales";

const messages = defineMessages({
  nameLabel: {
    id: "app.campaign_settings.name_label",
    defaultMessage: "Campaign name"
  },
  urlPathLabel: {
    id: "app.campaign_settings.form_url_path_label",
    defaultMessage: "Set form url path"
  },
  urlPathPlaceholder: {
    id: "app.campaign_settings.form_url_path_placeholder",
    defaultMessage: "MyCampaign"
  },
  formLanguageLabel: {
    id: "app.campaign_settings.form_language_label",
    defaultMessage: "Form language"
  },
  defaultLanguageLabel: {
    id: "app.campaign_settings.form_default_language_Label",
    defaultMessage: "Default (browser language)"
  },
  formTitleLabel: {
    id: "app.campaign_settings.form_title_label",
    defaultMessage: "Form title"
  },
  formPresentationLabel: {
    id: "app.campaign_settings.form_presentation_label",
    defaultMessage: "Form presentation text"
  },
  formThanksLabel: {
    id: "app.campaign_settings.form_thanks_label",
    defaultMessage: "After form submission text"
  },
  saveLabel: {
    id: "app.campaign_setings.save",
    defaultMessage: "Save"
  }
});

class CampaignSettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        campaignId: "",
        name: ""
      }
    };
  }
  static getDerivedStateFromProps({ campaign }, { formData }) {
    if (!campaign) {
      return {
        formData: {
          campaignId: "",
          name: "",
          forms: {}
        }
      };
    } else if (campaign._id !== formData.campaignId) {
      return {
        formData: {
          campaignId: campaign._id,
          name: campaign.name,
          forms: campaign.forms
        }
      };
    }
    return null;
  }
  _filledForm = () => {
    const { formData } = this.state;
    return formData.campaignId && formData.name;
  };
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      Meteor.call("campaigns.update", formData, (err, data) => {
        if (!err) {
          alertStore.add("Updated", "success");
        } else {
          alertStore.add(err);
        }
      });
    }
  };
  getValue = key => {
    const { formData } = this.state;
    return get(formData, key);
  };
  _getFormLanguageOptions = () => {
    const { intl } = this.props;
    return [
      {
        label: intl.formatMessage(messages.defaultLanguageLabel),
        value: ""
      }
    ].concat(
      Object.keys(languages).map(key => {
        return {
          label: languages[key],
          value: key
        };
      })
    );
  };
  _getFormLanguageValue = () => {
    const { formData } = this.state;
    let key = get(formData, "forms.crm.language");
    if (key) {
      return {
        label: languages[key],
        value: key
      };
    }
    return null;
  };
  render() {
    const { intl, campaign } = this.props;
    const { active, formData } = this.state;
    return (
      <>
        <Nav campaign={campaign} />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <Form.Field label={intl.formatMessage(messages.nameLabel)} big>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder={intl.formatMessage(messages.nameLabel)}
                onChange={this._handleChange}
              />
            </Form.Field>
            <h3>
              <FormattedMessage
                id="app.campaign_settings.form_settings_title"
                defaultMessage="Form settings"
              />
            </h3>
            <p>
              <FormattedMessage
                id="app.campaign_settings.form_settings_description"
                defaultMessage="Use the form to invite your audience to your campaign! Besides the link below, there's also an exclusive link for each person in your directory, improving data integration."
              />
            </p>
            <PersonFormInfo />
            <Form.Field
              label={intl.formatMessage(messages.urlPathLabel)}
              prefix={FlowRouter.url("")}
            >
              <input
                type="text"
                placeholder={intl.formatMessage(messages.urlPathPlaceholder)}
                name="forms.slug"
                value={this.getValue("forms.slug")}
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
                onChange={selected => {
                  this._handleChange({
                    target: {
                      name: "forms.crm.language",
                      value: selected.value
                    }
                  });
                }}
                name="forms.crm.language"
                value={this._getFormLanguageValue()}
              />
            </Form.Field>
            <Form.Field label={intl.formatMessage(messages.formTitleLabel)}>
              <input
                type="text"
                name="forms.crm.header"
                value={this.getValue("forms.crm.header")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field
              label={intl.formatMessage(messages.formPresentationLabel)}
            >
              <textarea
                name="forms.crm.text"
                value={this.getValue("forms.crm.text")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label={intl.formatMessage(messages.formThanksLabel)}>
              <textarea
                name="forms.crm.thanks"
                value={this.getValue("forms.crm.thanks")}
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
      </>
    );
  }
}

CampaignSettingsPage.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(CampaignSettingsPage);
