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
import PeriodField from "../../components/PeriodField.jsx";
import DesireField from "../../components/DesireField.jsx";
import UserUpgrade from "../../components/UserUpgrade.jsx";
import Disclaimer from "../../components/Disclaimer.jsx";

const messages = defineMessages({
  title: {
    id: "app.campaign.form.title",
    defaultMessage: "Create a campaign",
  },
  nameLabel: {
    id: "app.campaign.form.name.label",
    defaultMessage: "Define a title for your campaign",
  },
  namePlaceholder: {
    id: "app.campaign.form.name.placeholder",
    defaultMessage: "Title of your campaign",
  },
  missingFieldsError: {
    id: "app.campaign.form.missing_fields_error",
    defaultMessage: "Make sure you filled all the required fields",
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
  independentCampaignLabel: {
    id: "app.campaign.form.independent_campaign.label",
    defaultMessage: "Is it an independent candidacy?",
  },
  independentMandateLabel: {
    id: "app.campaign.form.independent_mandate.label",
    defaultMessage: "Is it an independent mandate?",
  },
  formatLabel: {
    id: "app.campaign.form.format.label",
    defaultMessage: "Which format?",
  },
  firstCampaignLabel: {
    id: "app.campaign.form.first_campaign.label",
    defaultMessage: "First campaign?",
  },
  firstMandateLabel: {
    id: "app.campaign.form.first_mandate.label",
    defaultMessage: "First mandate?",
  },
  causeLabel: {
    id: "app.campaign.form.cause.label",
    defaultMessage: "What is your main cause?",
  },
  goalLabel: {
    id: "app.campaign.form.goal.label",
    defaultMessage: "What do you want to achieve with the campaign?",
  },
  estimatedDurationLabel: {
    id: "app.campaign.form.estimated_duration.label",
    defaultMessage: "Estimated duration time",
  },
  organizerLabel: {
    id: "app.campaign.form.organizer.label",
    defaultMessage: "Who organizes this campaign?",
  },
  organizerLabel: {
    id: "app.campaign.form.organizer.label",
    defaultMessage: "Who organizes this campaign?",
  },
  candidateLabel: {
    id: "app.campaign.form.candidate.label",
    defaultMessage: "What is your candidacy name?",
  },
  partyLabel: {
    id: "app.campaign.form.party.label",
    defaultMessage: "Party, movement or coalition your candidacy is part of",
  },
  partyPlaceholder: {
    id: "app.campaign.form.party.placeholder",
    defaultMessage: "Party/movement/coalition",
  },
  periodLabel: {
    id: "app.campaign.form.period.label",
    defaultMessage: "Mandate period",
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
  managerLabel: {
    id: "app.campaign.form.manager.label",
    defaultMessage: "Liane will be managed by:",
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
      geolocationType: "",
      formData: {
        name: "",
        type: "",
        facebookAccountId: "",
      },
    };
    this.formContent = React.createRef();
  }
  componentDidMount() {
    this._validateUser();
  }
  componentDidUpdate(prevProps, prevState) {
    const { geolocationType, formData, currentStep } = this.state;
    if (JSON.stringify(formData) != JSON.stringify(prevState.formData)) {
      this._validateStep();
    }
    if (geolocationType != prevState.geolocationType) {
      this._validateStep();
    }
    if (formData.type != prevState.formData.type) {
      const firstStep = this._getSteps()[0];
      this.setState({ currentStep: firstStep.key });
    }
    if (prevState.currentStep != currentStep) {
      if (this.formContent.current) this.formContent.current.scrollTop = 0;
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
  _validateStep = (stepKey, updateState = true) => {
    const { currentStep, geolocationType, formData, agreed } = this.state;
    if (!currentStep) return;
    const stepsValidations = {
      candidate: () =>
        formData.candidate &&
        formData.birthday &&
        formData.gender &&
        formData.race,
      mandate: () =>
        formData.candidate &&
        formData.birthday &&
        formData.gender &&
        formData.race,
      campaign_details: () => {
        const { type } = formData;
        const defaultFields = formData.contact && formData.contact.email;
        if (type == "electoral") {
          return (
            defaultFields &&
            formData.hasOwnProperty("independent") &&
            formData.hasOwnProperty("first_campaign") &&
            formData.office &&
            formData.format
          );
        }
        if (type == "mandate") {
          return (
            defaultFields &&
            formData.hasOwnProperty("independent") &&
            formData.hasOwnProperty("first_mandate") &&
            formData.office &&
            formData.format &&
            formData.period &&
            formData.period.length == 2
          );
        }
        if (type == "activist") {
          return (
            defaultFields &&
            formData.cause &&
            formData.goal &&
            formData.estimated_duration &&
            formData.organizer
          );
        }
        return !!defaultFields;
      },
      location: () => {
        const defaultFields = formData.country;
        if (geolocationType != "national") {
          return defaultFields && formData.geolocation;
        }
        return !!defaultFields;
      },
      facebook: () => formData.facebookAccountId,
      expectation: () =>
        formData.expectation && formData.expectation.length && formData.manager,
      policy: () => agreed,
    };
    const step = stepKey || currentStep;
    const valid = stepsValidations[step] && stepsValidations[step]();
    if (updateState) {
      this.setState({ enableNextStep: valid });
    }
    return valid;
  };
  _validateUser = () => {
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
    const steps = this._getSteps();
    return !steps.some((step) => !this._validateStep(step.key, false));
  };
  _handleGeolocationChange = ({ geolocation, type }) => {
    if (geolocation) {
      this.setState({
        geolocationType: type,
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
        geolocationType: type,
        formData: {
          ...this.state.formData,
        },
      });
    }
  };
  _handleStartClick = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    const { formData } = this.state;
    if (!formData.name || !formData.type) {
      alertStore.add(intl.formatMessage(messages.missingFieldsError), "error");
    } else {
      this.setState({ start: true });
    }
  };
  _handleSubmit = (ev) => {
    ev.preventDefault();
    const { intl } = this.props;
    const { loading } = this.state;
    const invite = ClientStorage.get("invite");
    const detailsFields = [
      "birthday",
      "gender",
      "race",
      "independent",
      "first_campaign",
      "first_mandate",
      "format",
      "period",
      "goal",
      "estimated_duration",
      "organizer",
      "expectation",
      "manager",
    ];
    if (this._filledForm() && !loading) {
      const { formData } = this.state;
      this.setState({
        loading: true,
      });
      let data = { ...formData };

      if (invite) {
        data.invite = invite;
      }

      // Transform extra fields
      data.details = {};
      for (const key in data) {
        if (detailsFields.indexOf(key) !== -1) {
          data.details[key] = data[key];
          delete data[key];
        }
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
      geolocationType,
      formData,
      start,
      agreed,
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
      return <UserUpgrade onSuccess={this._validateUser} />;
    }
    if (!start) {
      return (
        <Form>
          <Form.Content>
            <Page.Title>{intl.formatMessage(messages.title)}</Page.Title>
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
                <FormattedMessage
                  id="app.campaign.form.start.label"
                  defaultMessage="Create my campaign"
                />
              </Button>
            </Page.Boxed>
          </Form.Content>
        </Form>
      );
    }
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Steps
          title={intl.formatMessage(messages.title)}
          currentStep={currentStep}
          onChange={this._handleStepChange}
          steps={this._getSteps()}
          enableNextStep={enableNextStep}
        />
        <Form.Content contentRef={this.formContent}>
          {loading ? <Loading full /> : null}
          {currentStep == "candidate" || currentStep == "mandate" ? (
            <>
              {currentStep == "candidate" ? (
                <p>
                  <FormattedMessage
                    id="app.campaign.form.candidate.description"
                    defaultMessage="You are creating an electoral campaign in Liane. Therefore, the following questions are about the candidate."
                  />
                </p>
              ) : (
                <p>
                  <FormattedMessage
                    id="app.campaign.form.mandate.description"
                    defaultMessage="You are creating a mandate campaign in Liane. Therefore, the following questions are about the elected person."
                  />
                </p>
              )}
              <Form.Field
                label={intl.formatMessage(messages.candidateLabel)}
                required
              >
                <input
                  type="text"
                  name="candidate"
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
              <Form.Field
                label={intl.formatMessage(messages.genderLabel)}
                required
              >
                <GenderField
                  name="gender"
                  onChange={this._handleChange}
                  value={formData.gender}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(messages.raceLabel)}
                required
              >
                <RaceField
                  name="race"
                  onChange={this._handleChange}
                  value={formData.race}
                />
              </Form.Field>
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
                  <Form.Field
                    label={intl.formatMessage(
                      formData.type == "electoral"
                        ? messages.independentCampaignLabel
                        : messages.independentMandateLabel
                    )}
                    required
                  >
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
                  {formData.type == "electoral" ? (
                    <Form.Field
                      label={intl.formatMessage(messages.firstCampaignLabel)}
                      required
                    >
                      <BooleanRadioField
                        name="first_campaign"
                        value={formData.first_campaign}
                        onChange={this._handleChange}
                      />
                    </Form.Field>
                  ) : (
                    <Form.Field
                      label={intl.formatMessage(messages.firstMandateLabel)}
                      required
                    >
                      <BooleanRadioField
                        name="first_mandate"
                        value={formData.first_mandate}
                        onChange={this._handleChange}
                      />
                    </Form.Field>
                  )}
                  <Form.Field
                    label={intl.formatMessage(messages.formatLabel)}
                    required
                  >
                    <Form.CheckboxGroup>
                      <label>
                        <input
                          type="radio"
                          name="format"
                          value="individual"
                          checked={formData.format == "individual"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.format.individual"
                          defaultMessage="Individual"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="format"
                          value="collective"
                          checked={formData.format == "collective"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.format.collective"
                          defaultMessage="Collective"
                        />
                      </label>
                    </Form.CheckboxGroup>
                  </Form.Field>
                  {formData.type == "mandate" ? (
                    <Form.Field
                      label={intl.formatMessage(messages.periodLabel)}
                    >
                      <PeriodField
                        name="period"
                        value={formData.period}
                        onChange={this._handleChange}
                      />
                    </Form.Field>
                  ) : null}
                </>
              ) : null}
              {formData.type == "activist" ? (
                <>
                  <Form.Field
                    label={intl.formatMessage(messages.causeLabel)}
                    required
                  >
                    <input
                      type="text"
                      name="cause"
                      onChange={this._handleChange}
                      value={formData.cause}
                    />
                  </Form.Field>
                  <Form.Field
                    label={intl.formatMessage(messages.goalLabel)}
                    required
                  >
                    <input
                      type="text"
                      name="goal"
                      onChange={this._handleChange}
                      value={formData.goal}
                    />
                  </Form.Field>
                  <Form.Field
                    label={intl.formatMessage(messages.estimatedDurationLabel)}
                    required
                  >
                    <input
                      type="text"
                      name="estimated_duration"
                      onChange={this._handleChange}
                      value={formData.estimated_duration}
                    />
                  </Form.Field>
                  <Form.Field
                    label={intl.formatMessage(messages.organizerLabel)}
                    required
                  >
                    <Form.CheckboxGroup>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="social_movement"
                          checked={formData.organizer == "social_movement"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.social_movement"
                          defaultMessage="Social movement"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="social_organization"
                          checked={formData.organizer == "social_organization"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.social_organization"
                          defaultMessage="Social organization"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="collective_organizations"
                          checked={
                            formData.organizer == "collective_organizations"
                          }
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.collective_organizations"
                          defaultMessage="A collective of organizations"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="ngo"
                          checked={formData.organizer == "ngo"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.ngo"
                          defaultMessage="NGO/Nonprofit"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="party"
                          checked={formData.organizer == "party"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.party"
                          defaultMessage="Political party"
                        />
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="organizer"
                          value="collective"
                          checked={formData.organizer == "collective"}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.campaign.form.organizer.collective"
                          defaultMessage="Independent collective"
                        />
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
                  regionType={geolocationType}
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
                <FormattedMessage
                  id="app.campaign.form.expectation_description"
                  defaultMessage="We know that you face many challenges on a day-to-day basis. Tell us what you are looking to face with Liane."
                />
              </p>
              <Form.Field>
                <DesireField
                  name="expectation"
                  value={formData.expectation}
                  onChange={this._handleChange}
                />
              </Form.Field>
              <Form.Field
                label={intl.formatMessage(messages.managerLabel)}
                required
              >
                <Form.CheckboxGroup>
                  {formData.type == "electoral" ? (
                    <label>
                      <input
                        type="radio"
                        name="manager"
                        value="candidate"
                        checked={formData.manager == "candidate"}
                        onChange={this._handleChange}
                      />
                      <FormattedMessage
                        id="app.campaign.form.manager.candidate"
                        defaultMessage="Candidate"
                      />
                    </label>
                  ) : null}
                  {formData.type == "mandate" ? (
                    <label>
                      <input
                        type="radio"
                        name="manager"
                        value="elected"
                        checked={formData.manager == "elected"}
                        onChange={this._handleChange}
                      />
                      <FormattedMessage
                        id="app.campaign.form.manager.elected_person"
                        defaultMessage="Elected person"
                      />
                    </label>
                  ) : null}
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="team"
                      checked={formData.manager == "team"}
                      onChange={this._handleChange}
                    />
                    <FormattedMessage
                      id="app.campaign.form.manager.team"
                      defaultMessage="Team"
                    />
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="volunteer"
                      checked={formData.manager == "volunteer"}
                      onChange={this._handleChange}
                    />
                    <FormattedMessage
                      id="app.campaign.form.manager.volunteer"
                      defaultMessage="Volunteer"
                    />
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="manager"
                      value="third_party"
                      checked={formData.manager == "third_party"}
                      onChange={this._handleChange}
                    />
                    <FormattedMessage
                      id="app.campaign.form.manager.third_party"
                      defaultMessage="Third party (consultant or agency)"
                    />
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
              checked={agreed}
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
