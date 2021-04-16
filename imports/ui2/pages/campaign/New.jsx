import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { set, get } from "lodash";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Button from "../../components/Button.jsx";
import Form from "../../components/Form.jsx";
import Loading from "../../components/Loading.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";
import CampaignTypeSelect from "../../components/CampaignTypeSelect.jsx";
import OfficeField from "../../components/OfficeField.jsx";
import CountrySelect from "../../components/CountrySelect.jsx";
import GeolocationSearch from "../../components/GeolocationSearch.jsx";
import UserUpgrade from "../../components/UserUpgrade.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";

const messages = defineMessages({
  nameLabel: {
    id: "app.campaign.form.name.label",
    defaultMessage: "Define a title for your campaign",
  },
  namePlaceholder: {
    id: "app.campaign.form.name.placeholder",
    defaultMessage: "Title of your campaign",
  },
  typeLabel: {
    id: "app.campaign.form.type.label",
    defaultMessage: "What type of campaign are you running?",
  },
  typePlaceholder: {
    id: "app.campaign.form.type.placeholder",
    defaultMessage: "Campaign type",
  },
  causeLabel: {
    id: "app.campaign.form.cause.label",
    defaultMessage: "What is your main cause?",
  },
  candidateLabel: {
    id: "app.campaign.form.candidate.label",
    defaultMessage: "What is your candidacy name?",
  },
  candidatePlaceholder: {
    id: "app.campaign.form.candidate.placeholder",
    defaultMessage: "Public name",
  },
  partyLabel: {
    id: "app.campaign.form.party.label",
    defaultMessage: "Party, movement or coalition your candidacy is part of",
  },
  partyPlaceholder: {
    id: "app.campaign.form.party.placeholder",
    defaultMessage: "Party/movement/coalition",
  },
  emailLabel: {
    id: "app.campaign.form.email.label",
    defaultMessage: "Public email",
  },
  phoneLabel: {
    id: "app.campaign.form.phone.label",
    defaultMessage: "Public phone number",
  },
  countryLabel: {
    id: "app.campaign.form.country.label",
    defaultMessage: "Select the country for your campaign",
  },
  officeLabel: {
    id: "app.campaign.form.office.label",
    defaultMessage: "Select the office you are running for",
  },
  submitLabel: {
    id: "app.campaign.form.submit",
    defaultMessage: "Register campaign",
  },
  requiredFields: {
    id: "app.campaign.form.required_fields_warning",
    defaultMessage: "You must fill all the required fields",
  },
  consentText: {
    id: "app.campaign.form.consent",
    defaultMessage: "I agree and wish to create my campaign",
  },
});

const stepsLabels = defineMessages({
  basic_info: {
    id: "app.campaign.form.steps.basic_info",
    defaultMessage: "Basic information",
  },
  campaign_details: {
    id: "app.campaign.form.steps.campaign_details",
    defaultMessage: "Campaign details",
  },
  location: {
    id: "app.campaign.form.steps.location",
    defaultMessage: "Location",
  },
  facebook: {
    id: "app.campaign.form.steps.facebook",
    defaultMessage: "Facebook page",
  },
  policy: {
    id: "app.campaign.form.steps.policy",
    defaultMessage: "Policy agreement",
  },
});

class NewCampaignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: 0,
      agreed: false,
      ready: false,
      validation: false,
      loading: false,
      formData: {
        name: "",
        type: "",
        facebookAccountId: "",
      },
    };
  }
  componentDidMount() {
    this._validate();
  }
  _handleStepChange = (stepIndex) => {
    this.setState({ currentStep: stepIndex });
  };
  _getSteps = () => {
    const { intl } = this.props;
    let steps = [
      "basic_info",
      "campaign_details",
      "location",
      "facebook",
      "policy",
    ];
    return steps.map((step) => {
      return { key: step, label: intl.formatMessage(stepsLabels[step]) };
    });
  };
  _validate = () => {
    const invite = ClientStorage.get("invite");
    this.setState({ ready: false });
    let data = {};
    if (invite) data.invite = invite;
    Meteor.call("users.validateCampaigner", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        this.setState({
          ready: true,
          validation: res,
        });
      }
    });
  };
  _handleChange = ({ target }) => {
    const newFormData = { ...this.state.formData };
    set(newFormData, target.name, target.value);
    this.setState({
      formData: newFormData,
    });
  };
  _handleConsentChange = (checked) => {
    this.setState({
      agreed: !!checked,
    });
  };
  getValue = (key) => {
    const { formData } = this.state;
    return get(formData, key);
  };
  _filledForm = () => {
    const { agreed, formData } = this.state;
    const defaultValidation =
      agreed &&
      formData.name &&
      formData.type &&
      formData.country &&
      formData.facebookAccountId &&
      formData.geolocation &&
      formData.geolocation.osm_id &&
      formData.contact &&
      formData.contact.email;

    if (formData.type.match(/electoral|mandate/)) {
      return (
        defaultValidation &&
        formData.party &&
        formData.candidate &&
        formData.office
      );
    }

    if (formData.type.match(/mobilization/)) {
      return defaultValidation && formData.cause;
    }
    return defaultValidation;
  };
  _handleGeolocationChange = ({ geolocation, type }) => {
    if (geolocation) {
      this.setState({
        formData: {
          ...this.state.formData,
          geolocation: {
            type,
            osm_id: geolocation.osm_id,
            osm_type: geolocation.osm_type,
          },
        },
      });
    } else {
      this.setState({
        formData: {
          ...this.state.formData,
          geolocation: {},
        },
      });
    }
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    const { loading } = this.state;
    const invite = ClientStorage.get("invite");
    if (this._filledForm() && !loading) {
      const { formData } = this.state;
      this.setState({
        loading: true,
      });
      let data = { ...formData };
      if (invite) {
        data.invite = invite;
      }
      Meteor.call("campaigns.create", data, (err, data) => {
        if (err) {
          alertStore.add(err);
          this.setState({
            loading: false,
          });
        } else {
          window.location = `/?campaignId=${data.result}`;
        }
      });
    } else {
      alertStore.add(intl.formatMessage(messages.requiredFields), "error");
    }
  };
  _handleNextStepClick = (ev) => {
    ev.preventDefault();
    this.setState({
      currentStep: this.state.currentStep + 1,
    });
  };
  _getStepLabel = (stepIndex) => {
    return this._getSteps()[stepIndex].label;
  };
  render() {
    const { intl } = this.props;
    const { currentStep, ready, validation, loading, formData } = this.state;
    if (!ready) {
      return <Loading full />;
    }
    if (!validation.enabled) {
      return (
        <Page.Boxed>
          <h2>
            <FormattedMessage
              id="app.campaigns.disabled_title"
              defaultMessage="Campaign creation not available"
            />
          </h2>
          <p>
            <FormattedMessage
              id="app.campaigns.disabled_text"
              defaultMessage="Campaign creation is currently invitation only, contact {email} for more information!"
              values={{
                email: Meteor.settings.public.contactEmail,
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id="app.campaigns.disabled_text_2"
              defaultMessage="If you want to join the team of an existing campaign, contact the administrator of that campaign."
            />
          </p>
        </Page.Boxed>
      );
    }
    if (validation.enabled && !validation.validUser) {
      return <UserUpgrade onSuccess={this._validate} />;
    }
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Steps
          title="Create a campaign"
          currentStep={currentStep}
          onChange={this._handleStepChange}
          steps={this._getSteps().map((step) => step.label)}
        />
        <Form.Content>
          {loading ? <Loading full /> : null}
          {currentStep == 0 ? (
            <>
              <Form.Field label={intl.formatMessage(messages.nameLabel)} big>
                <input
                  type="text"
                  name="name"
                  placeholder={intl.formatMessage(messages.namePlaceholder)}
                  onChange={this._handleChange}
                  value={formData.name}
                  big
                />
              </Form.Field>
              <Form.Field label={intl.formatMessage(messages.typeLabel)}>
                <CampaignTypeSelect
                  name="type"
                  placeholder={intl.formatMessage(messages.typePlaceholder)}
                  onChange={this._handleChange}
                  value={formData.type}
                />
              </Form.Field>
            </>
          ) : null}
          {currentStep == 1 ? (
            <>
              {formData.type.match(/electoral|mandate/) ? (
                <>
                  <h2>
                    <FormattedMessage
                      id="app.campaign.form.candidate_title"
                      defaultMessage="Candidate"
                    />
                  </h2>
                  <p>
                    <p>
                      You are creating an electoral campaign in Liane.
                      Therefore, the following questions are about the
                      candidate.
                    </p>
                  </p>
                  <Form.Field
                    label={intl.formatMessage(messages.candidateLabel)}
                  >
                    <input
                      type="text"
                      name="candidate"
                      placeholder={intl.formatMessage(
                        messages.candidatePlaceholder
                      )}
                      onChange={this._handleChange}
                      value={formData.candidate}
                    />
                  </Form.Field>
                  <Form.Field label={intl.formatMessage(messages.partyLabel)}>
                    <input
                      type="text"
                      name="party"
                      placeholder={intl.formatMessage(
                        messages.partyPlaceholder
                      )}
                      onChange={this._handleChange}
                      value={formData.party}
                    />
                  </Form.Field>
                </>
              ) : null}
              {formData.type.match(/mobilization/) ? (
                <Form.Field label={intl.formatMessage(messages.causeLabel)}>
                  <input
                    type="text"
                    name="cause"
                    onChange={this._handleChange}
                    value={formData.cause}
                  />
                </Form.Field>
              ) : null}
              <h3>
                <FormattedMessage
                  id="app.campaign.form.section_title.contact"
                  defaultMessage="Contact information"
                />
              </h3>
              <Form.Field label={intl.formatMessage(messages.emailLabel)}>
                <input
                  type="text"
                  name="contact.email"
                  value={this.getValue("contact.email")}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(messages.phoneLabel)}
                optional
              >
                <input
                  type="text"
                  name="contact.phone"
                  value={this.getValue("contact.phone")}
                  onChange={this._handleChange}
                />
              </Form.Field>
            </>
          ) : null}
          {currentStep == 2 ? (
            <>
              <Form.Field label={intl.formatMessage(messages.countryLabel)}>
                <CountrySelect
                  name="country"
                  value={formData.country}
                  onChange={this._handleChange}
                />
              </Form.Field>
              {formData.country && formData.type.match(/electoral|mandate/) ? (
                <Form.Field label={intl.formatMessage(messages.officeLabel)}>
                  <OfficeField
                    country={formData.country}
                    name="office"
                    onChange={this._handleChange}
                  />
                </Form.Field>
              ) : null}
              {formData.country ? (
                <GeolocationSearch
                  country={formData.country}
                  onChange={this._handleGeolocationChange}
                />
              ) : null}
            </>
          ) : null}
          {currentStep == 3 ? (
            <>
              <p>
                <FormattedMessage
                  id="app.campaign.form.select_account"
                  defaultMessage="Select the Facebook account to be used by your campaign"
                />
              </p>
              <SelectAccount
                name="facebookAccountId"
                onChange={this._handleChange}
                value={formData.facebookAccountId}
              />
            </>
          ) : null}
          {currentStep == 4 ? (
            <Disclaimer
              type="security"
              consent={intl.formatMessage(messages.consentText)}
              onChange={this._handleConsentChange}
            >
              <p>
                <FormattedMessage
                  id="app.campaign.form.disclaimer_01"
                  defaultMessage="We guarantee that only people who have the permissions provided by Facebook or the campaign's team can access public data of user interactions in the campaign's social networks, and we make sure that the use of such data by the campaigns is in good faith, non-malicious and in accordance with the law."
                />
              </p>
              <p>
                <FormattedMessage
                  id="app.campaign.form.disclaimer_02"
                  defaultMessage="Any type of behavior contrary to these principles detected by Liane's team, may be grounds for deletion of the campaign and its data."
                />
              </p>
            </Disclaimer>
          ) : null}
        </Form.Content>
        <Form.Actions>
          {currentStep == this._getSteps().length - 1 ? (
            <input
              type="submit"
              disabled={!this._filledForm() || loading}
              value={intl.formatMessage(messages.submitLabel)}
            />
          ) : (
            <Button onClick={this._handleNextStepClick}>
              <FormattedMessage
                id="app.campaign.form.next_step.label"
                defaultMessage="Next step:"
              />{" "}
              {this._getStepLabel(currentStep + 1)}
            </Button>
          )}
        </Form.Actions>
      </Form>
    );
  }
}

NewCampaignPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NewCampaignPage);
