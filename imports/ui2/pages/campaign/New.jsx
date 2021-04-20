import React, { Component } from "react";
import styled from "styled-components";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import { ClientStorage } from "meteor/ostrio:cstorage";
import { set, get } from "lodash";

import DatePicker from "react-datepicker";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Button from "../../components/Button.jsx";
import Form from "../../components/Form.jsx";
import Loading from "../../components/Loading.jsx";
import BooleanRadioField from "../../components/BooleanRadioField.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";
import CampaignTypeSelect from "../../components/CampaignTypeSelect.jsx";
import GenderField from "../../components/GenderField.jsx";
import RaceField from "../../components/RaceField.jsx";
import OfficeField from "../../components/OfficeField.jsx";
import CountrySelect from "../../components/CountrySelect.jsx";
import GeolocationSearch from "../../components/GeolocationSearch.jsx";
import DesireField from "../../components/DesireField.jsx";
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
  birthdayLabel: {
    id: "app.campaign.form.birthday.label",
    defaultMessage: "Birthday",
  },
  genderLabel: {
    id: "app.campaign.form.gender.label",
    defaultMessage: "Gender",
  },
  raceLabel: {
    id: "app.campaign.form.race.label",
    defaultMessage: "Race",
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
  candidate: {
    id: "app.campaign.form.steps.candidate",
    defaultMessage: "Candidate",
  },
  mandate: {
    id: "app.campaign.form.steps.mandate",
    defaultMessage: "Mandate",
  },
  campaign_details: {
    id: "app.campaign.form.steps.campaign_details",
    defaultMessage: "Campaign details",
  },
  location: {
    id: "app.campaign.form.steps.location",
    defaultMessage: "Location",
  },
  expectation: {
    id: "app.campaign.form.steps.expectation",
    defaultMessage: "Expectation",
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

const Start = styled.div`
  background: #fff;
  padding: 2rem;
  border-radius: 7px;
`;

class NewCampaignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStep: false,
      enableNextStep: false,
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
  componentDidUpdate(prevProps, prevState) {
    const { formData } = this.state;
    if (JSON.stringify(formData) != JSON.stringify(prevState.formData)) {
      this._validateStep();
    }
    if (formData.type != prevState.formData.type) {
      const firstStep = this._getSteps()[0];
      this.setState({ currentStep: firstStep.key });
    }
  }
  _handleStepChange = (stepKey) => {
    const { currentStep } = this.state;
    this._validateStep(stepKey);
    this.setState({ currentStep: stepKey });
  };
  _getNextStep = () => {
    const { currentStep } = this.state;
    const steps = this._getSteps();
    const index = steps.findIndex((step) => step.key == currentStep);
    return steps[index + 1];
  };
  _isLastStep = () => {
    return !this._getNextStep();
  };
  _handleNextStepClick = (ev) => {
    ev.preventDefault();
    const nextStep = this._getNextStep();
    this._validateStep(nextStep.key);
    this.setState({
      currentStep: nextStep.key,
    });
  };
  _getSteps = () => {
    const { intl } = this.props;
    const { formData } = this.state;
    let steps;
    switch (formData.type) {
      case "electoral":
        steps = [
          "candidate",
          "campaign_details",
          "location",
          "facebook",
          "expectation",
          "policy",
        ];
        break;
      case "mandate":
        steps = [
          "mandate",
          "campaign_details",
          "location",
          "facebook",
          "expectation",
          "policy",
        ];
        break;
      default:
        steps = [
          "campaign_details",
          "location",
          "facebook",
          "expectation",
          "policy",
        ];
    }
    return steps.map((step) => {
      return { key: step, label: intl.formatMessage(stepsLabels[step]) };
    });
  };
  _validateStep = (stepKey) => {
    const { currentStep, formData, agreed } = this.state;
    if (!currentStep) return;
    const stepsValidations = {
      candidate: () => formData.candidate && formData.birthday,
      campaign_details: () => formData.contact && formData.contact.email,
      location: () => formData.country,
      facebook: () => formData.facebookAccountId,
      expectation: () => formData.expectation && formData.manager,
      policy: () => agreed,
    };
    const steps = this._getSteps();
    const step = stepKey || currentStep;
    const valid = stepsValidations[step] && stepsValidations[step]();
    this.setState({ enableNextStep: valid });
    return valid;
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
      const newFormData = { ...this.state.formData };
      delete newFormData.geolocation;
      this.setState({
        formData: {
          ...this.state.formData,
        },
      });
    }
  };
  _handleStartClick = (ev) => {
    ev.preventDefault();
    const { formData } = this.state;
    if (!formData.name || !formData.type) {
      alertStore.add("Make sure you filled all the required fields", "error");
    } else {
      this.setState({ start: true });
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
  _getStepLabel = (stepIndex) => {
    return this._getSteps()[stepIndex].label;
  };
  _getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "birthday");
    if (value) {
      return value;
    }
    return null;
  }
  render() {
    const { intl } = this.props;
    const {
      currentStep,
      enableNextStep,
      ready,
      validation,
      loading,
      formData,
      start,
    } = this.state;
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
    if (!start) {
      return (
        <Form>
          <Form.Content>
            <Page.Title>Create a campaign</Page.Title>
            <Page.Boxed>
              <Form.Field
                label={intl.formatMessage(messages.nameLabel)}
                big
                required
              >
                <input
                  type="text"
                  name="name"
                  placeholder={intl.formatMessage(messages.namePlaceholder)}
                  onChange={this._handleChange}
                  value={formData.name}
                  big
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(messages.typeLabel)}
                big
                required
              >
                <CampaignTypeSelect
                  name="type"
                  placeholder={intl.formatMessage(messages.typePlaceholder)}
                  onChange={this._handleChange}
                  value={formData.type}
                  spread
                />
              </Form.Field>
              <Button primary onClick={this._handleStartClick}>
                Create my campaign
              </Button>
            </Page.Boxed>
          </Form.Content>
        </Form>
      );
    }
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Steps
          title="Create a campaign"
          currentStep={currentStep}
          onChange={this._handleStepChange}
          steps={this._getSteps()}
          enableNextStep={enableNextStep}
        />
        <Form.Content>
          {loading ? <Loading full /> : null}
          {currentStep == "candidate" ? (
            <>
              {formData.type.match(/electoral|mandate/) ? (
                <>
                  <p>
                    <p>
                      You are creating an electoral campaign in Liane.
                      Therefore, the following questions are about the
                      candidate.
                    </p>
                  </p>
                  <Form.Field
                    label={intl.formatMessage(messages.candidateLabel)}
                    required
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
                  <Form.Field
                    label={intl.formatMessage(messages.birthdayLabel)}
                    required
                  >
                    <div>
                      <DatePicker
                        onChange={(date) => {
                          this._handleChange({
                            target: {
                              name: "birthday",
                              value: date,
                            },
                          });
                        }}
                        selected={this._getBirthdayValue()}
                        dateFormatCalendar="MMMM"
                        dateFormat="P"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                      />
                    </div>
                  </Form.Field>
                  <Form.Field label={intl.formatMessage(messages.genderLabel)}>
                    <GenderField
                      name="gender"
                      onChange={this._handleChange}
                      value={formData.gender}
                    />
                  </Form.Field>
                  <Form.Field label={intl.formatMessage(messages.raceLabel)}>
                    <RaceField
                      name="race"
                      onChange={this._handleChange}
                      value={formData.race}
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
            </>
          ) : null}
          {currentStep == "campaign_details" ? (
            <>
              <Form.Field
                label={intl.formatMessage(messages.emailLabel)}
                required
              >
                <input
                  type="text"
                  name="contact.email"
                  value={this.getValue("contact.email")}
                  onChange={this._handleChange}
                />
              </Form.Field>

              {formData.type.match(/electoral|mandate/) ? (
                <>
                  <Form.Field label="Is your candidacy independent?" required>
                    <BooleanRadioField
                      name="independent"
                      value={formData.independent}
                      onChange={this._handleChange}
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
                  <Form.Field
                    label={intl.formatMessage(messages.officeLabel)}
                    required
                  >
                    <OfficeField
                      country={formData.country}
                      value={formData.office}
                      name="office"
                      onChange={this._handleChange}
                    />
                  </Form.Field>
                  <Form.Field label="First campaign?" required>
                    <BooleanRadioField
                      name="first_campaign"
                      value={formData.first_campaign}
                      onChange={this._handleChange}
                    />
                  </Form.Field>
                  <Form.Field label="Which format is your campaign?">
                    <Form.CheckboxGroup>
                      <label>
                        <input
                          type="radio"
                          name="campaign_format"
                          value="individual"
                          checked={formData.campaign_format == "individual"}
                          onChange={this._handleChange}
                        />
                        Individual
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="campaign_format"
                          value="collective"
                          checked={formData.campaign_format == "collective"}
                          onChange={this._handleChange}
                        />
                        Collective
                      </label>
                    </Form.CheckboxGroup>
                  </Form.Field>
                </>
              ) : null}
            </>
          ) : null}
          {currentStep == "location" ? (
            <>
              <Form.Field label={intl.formatMessage(messages.countryLabel)}>
                <CountrySelect
                  name="country"
                  value={formData.country}
                  onChange={this._handleChange}
                />
              </Form.Field>
              {formData.country ? (
                <GeolocationSearch
                  country={formData.country}
                  onChange={this._handleGeolocationChange}
                />
              ) : null}
            </>
          ) : null}
          {currentStep == "facebook" ? (
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
          {currentStep == "expectation" ? (
            <>
              <p>
                Nós sabemos que você enfrenta muitos desafios no dia-a-dia.
                Marque o que você está buscando enfrentar com Liane:
              </p>
              <DesireField
                name="expectation"
                value={formData.expectation}
                onChange={this._handleChange}
              />{" "}
              <Form.Field label="Liane will be managed by:">
                <Form.CheckboxGroup>
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="team"
                      checked={formData.manager == "team"}
                      onChange={this._handleChange}
                    />
                    Team
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="volunteer"
                      checked={formData.manager == "volunteer"}
                      onChange={this._handleChange}
                    />
                    Volunteer
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="third_party"
                      checked={formData.manager == "third_party"}
                      onChange={this._handleChange}
                    />
                    Third party (consultant or agency)
                  </label>
                </Form.CheckboxGroup>
              </Form.Field>
            </>
          ) : null}
          {currentStep == "policy" ? (
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
          {this._isLastStep() ? (
            <input
              type="submit"
              disabled={!this._filledForm() || loading}
              value={intl.formatMessage(messages.submitLabel)}
            />
          ) : (
            <Button
              onClick={this._handleNextStepClick}
              disabled={!enableNextStep}
            >
              <FormattedMessage
                id="app.campaign.form.next_step.label"
                defaultMessage="Next step:"
              />{" "}
              {this._getNextStep().label}
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
