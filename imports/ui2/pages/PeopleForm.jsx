import React, { Component } from "react";
import styled from "styled-components";
import { get, merge } from "lodash";
import { OAuth } from "meteor/oauth";
import moment from "moment";

import Recaptcha from "react-recaptcha";
import {
  IntlProvider,
  addLocaleData,
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";

import en from "react-intl/locale-data/en";
import es from "react-intl/locale-data/es";
import pt from "react-intl/locale-data/pt";
addLocaleData([...en, ...es, ...pt]);
window.locales = ["en-US", "es", "pt-BR"];

import localeData from "/locales";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DatePicker from "react-datepicker";

import Alerts, { alertStore } from "../containers/Alerts.jsx";

import AddressField from "../components/AddressField.jsx";
import SkillsField from "../components/SkillsField.jsx";

import { getFormUrl } from "../utils/people.js";
import Loading from "../components/Loading.jsx";
import Button from "../components/Button.jsx";
import Form from "../components/Form.jsx";
import CountryExclusive from "../components/CountryExclusive.jsx";

const recaptchaSiteKey = Meteor.settings.public.recaptcha;

const messages = defineMessages({
  requiredName: {
    id: "app.people_form.name_required",
    defaultMessage: "Name is required",
  },
  requiredEmail: {
    id: "app.people_form.email_required",
    defaultMessage: "Email is required",
  },
  requiredEmailOrPhone: {
    id: "app.people_form.email_phone_required",
    defaultMessage: "Email or phone is required",
  },
  thankYou: {
    id: "app.people_form.thank_you",
    defaultMessage: "Thank you!",
  },
  nameLabel: {
    id: "app.people_form.name_label",
    defaultMessage: "Name",
  },
  emailLabel: {
    id: "app.people_form.email_label",
    defaultMessage: "Email",
  },
  phoneLabel: {
    id: "app.people_form.phone_label",
    defaultMessage: "Phone",
  },
  birthdayLabel: {
    id: "app.people_form.birthday_label",
    defaultMessage: "Birthday",
  },
  skillsLabel: {
    id: "app.people_form.skills_label",
    defaultMessage: "What can you do?",
  },
  sendLabel: {
    id: "app.people_form.submit_label",
    defaultMessage: "Send",
  },
});

const Header = styled.header`
  background: #fff;
  padding: 1rem 0;
  .header-content {
    max-width: 700px;
    margin: 0 auto;
    h1 {
      margin: 0;
      img {
        display: block;
        max-width: 50px;
        height: auto;
      }
    }
  }
  @media (max-width: 770px) {
    padding: 1rem;
  }
`;

const Container = styled.div`
  max-width: 700px;
  margin: 4rem auto;
  h2 {
    font-family: "Open sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 2em;
  }
  .not-you {
    color: #999;
    margin-top: -1rem;
    font-size: 0.8em;
    margin-bottom: 2rem;
  }
  form {
    padding: 2rem;
    margin: 2rem -2rem 2rem;
    border: 1px solid #ddd;
    border-radius: 7px;
    background: #fff;
  }
  .facebook-connect {
    .button {
      background: #3b5998;
      color: #fff;
      margin: 0;
      svg {
        margin-right: 1rem;
      }
      &:hover,
      &:active,
      &:focus {
        background: #333;
      }
    }
  }
  .contribute {
    margin-top: 1rem;
  }
  .policy {
    margin: 2rem 0 1rem;
    font-size: 0.8em;
    color: #666;
  }
  .recaptcha-container {
    margin: 2rem 0 0 0;
    .g-recaptcha > div {
      margin: 0 auto;
    }
  }
  .button {
    margin: 0;
  }
  @media (max-width: 770px) {
    margin: 4rem 1rem 0;
    form {
      padding: 1rem;
      margin: 2rem -1rem 0;
      border-left: 0;
      border-right: 0;
      border-radius: 0;
    }
  }
`;

class PeopleForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {},
      loading: false,
      sent: false,
      donor: false,
      contribute: false,
    };
    this._handleFacebookClick = this._handleFacebookClick.bind(this);
    this._handleRecaptcha = this._handleRecaptcha.bind(this);
    this._handleSubmit = this._handleSubmit.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    const { person, personData } = this.props;
    if (nextProps.person && (!person || nextProps.person._id !== person._id)) {
      // Autofill with available data?
      let formData = {
        ...this.state.formData,
        name: get(nextProps.person, "name"),
        email: get(nextProps.person, "campaignMeta.contact.email"),
        cellphone: get(nextProps.person, "campaignMeta.contact.cellphone"),
        birthday: get(nextProps.person, "campaignMeta.basic_info.birthday"),
        address: get(nextProps.person, "campaignMeta.basic_info.address"),
        skills: get(nextProps.person, "campaignMeta.basic_info.skills"),
        supporter: get(nextProps.person, "campaignMeta.supporter"),
        mobilizer: get(nextProps.person, "campaignMeta.mobilizer"),
        donor: get(nextProps.person, "campaignMeta.donor"),
        volunteer: get(nextProps.person, "campaignMeta.volunteer"),
      };
      merge(formData, personData);
      // const contribute =
      //   formData.donor || formData.mobilizer || formData.supporter;
      this.setState({ formData, contribute: false });
    }
  }
  _handleChange = ({ target }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]:
          target.type == "checkbox" ? target.checked : target.value,
      },
    });
  };
  _handleFacebookClick() {
    const { campaign } = this.props;
    Facebook.requestCredential(
      {
        requestPermissions: ["public_profile", "email"],
      },
      (token) => {
        const secret = OAuth._retrieveCredentialSecret(token) || null;
        Meteor.call(
          "peopleForm.connectFacebook",
          { token, secret, campaignId: campaign._id },
          (err, res) => {
            if (err) {
              alertStore.add(err);
            } else {
              FlowRouter.go("/f/" + res);
            }
          }
        );
      }
    );
  }
  _handleRecaptcha(res) {
    this.setState({
      formData: {
        ...this.state.formData,
        recaptcha: res,
      },
    });
  }
  _handleDeleteDataClick() {
    Facebook.requestCredential({
      requestPermissions: [],
    });
  }
  _displayParticipateButton = () => {
    const { person } = this.props;
    return !(
      person.campaignMeta &&
      (person.campaignMeta.donor ||
        person.campaignMeta.supporter ||
        person.campaignMeta.mobilizer)
    );
  };
  _handleSubmit(ev) {
    ev.preventDefault();
    const { intl, formId, person, campaign } = this.props;
    const { formData } = this.state;
    let data = { ...formData, campaignId: campaign._id };
    if (formId) {
      data.formId = formId;
    }
    if (person.facebookId) {
      data.facebookId = person.facebookId;
    }
    if (!data.name) {
      alertStore.add(intl.formatMessage(messages.requiredName), "error");
      return;
    }
    if (!data.email && !data.cellphone) {
      alertStore.add(
        intl.formatMessage(messages.requiredEmailOrPhone),
        "error"
      );
      return;
    }
    this.setState({ loading: true });
    Meteor.call("peopleForm.submit", data, (err, res) => {
      if (err) {
        alertStore.add(err);
      } else {
        alertStore.add(intl.formatMessage(messages.thankYou), "success");
      }
      if (res) {
        FlowRouter.go("/f/" + res);
        this.setState({ sent: true, loading: false, donor: formData.donor });
        setTimeout(() => {
          if (formData.donor) {
            window.location = campaign.forms.crm.donation;
          } else {
            window.location =
              campaign.forms.crm.redirect ||
              `https://facebook.com/${campaign.facebookAccount.facebookId}`;
          }
        }, 5000);
      } else {
        this.setState({ loading: false });
      }
    });
  }
  _hasDonationUrl = () => {
    const { campaign } = this.props;
    return !!get(campaign, "forms.crm.donation");
  };
  getBirthdayValue() {
    const { formData } = this.state;
    const value = get(formData, "birthday");
    if (value) {
      return value;
    }
    return null;
  }
  render() {
    const { intl, loading, person, campaign } = this.props;
    const { sent, formData, donor, contribute } = this.state;
    if (loading || this.state.loading) {
      return <Loading full />;
    } else if (!loading && !campaign) {
      return <h1 style={{ textAlign: "center" }}>404</h1>;
    } else if (person && campaign) {
      return (
        <>
          <Header>
            <div className="header-content">
              <h1>
                <a href={FlowRouter.path("App.dashboard")}>
                  <img src="/images/logo_icon.png" alt="Liane" />
                </a>
              </h1>
            </div>
          </Header>
          <Container id="app">
            {sent ? (
              <>
                <h2>
                  <FormattedMessage
                    id="app.people_form.thank_you"
                    defaultMessage="Thank you!"
                  />
                </h2>
                <p>
                  {campaign.forms && campaign.forms.crm ? (
                    campaign.forms.crm.thanks
                  ) : (
                    <FormattedMessage
                      id="app.people_form.thank_you_text"
                      defaultMessage="Your participation means a lot to us."
                    />
                  )}
                </p>
                {donor ? (
                  <p>
                    <FormattedHTMLMessage
                      id="app.people_form.donation_redirect_text"
                      defaultMessage="You are being redirected to the donation page. <a href='{url}'>Click here to access directly</a>."
                      values={{
                        url: campaign.forms.crm.donation,
                      }}
                    />
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <h2>
                  {person.name ? (
                    <FormattedMessage
                      id="app.people_form.welcome_logged_in"
                      defaultMessage="Hi {name}!"
                      values={{ name: person.name }}
                    />
                  ) : (
                    <FormattedMessage
                      id="app.people_form.welcome_anonymous"
                      defaultMessage="Hi!"
                    />
                  )}
                </h2>
                {person._id ? (
                  <p className="not-you">
                    <FormattedMessage
                      id="app.people_form.not_you"
                      defaultMessage="Not you?"
                    />{" "}
                    <a href={getFormUrl(false, campaign)}>
                      <FormattedMessage
                        id="app.people_form.click_here"
                        defaultMessage="Click here"
                      />
                    </a>
                    .
                  </p>
                ) : null}
                <p>
                  {campaign.forms && campaign.forms.crm ? (
                    <span>{campaign.forms.crm.header}</span>
                  ) : (
                    <FormattedMessage
                      id="app.people_form.default_header"
                      defaultMessage="We, from the campaign {campaign_name}, would like to ask for your help!"
                      values={{ campaign_name: campaign.name }}
                    />
                  )}
                </p>
                <p>
                  {campaign.forms && campaign.forms.crm ? (
                    <span>{campaign.forms.crm.text}</span>
                  ) : (
                    <FormattedMessage
                      id="app.people_form.default_text"
                      defaultMessage="Fill the information below so you can know more about you."
                    />
                  )}
                </p>
                {/* {!person.facebookId ? (
                  <div className="facebook-connect">
                    <Button
                      fluid
                      color="facebook"
                      icon
                      onClick={this._handleFacebookClick}
                    >
                      <FontAwesomeIcon icon={["fab", "facebook-square"]} />{" "}
                      <FormattedMessage
                        id="app.people_form.facebook_connect_label"
                        defaultMessage="Connect your Facebook profile"
                      />
                    </Button>
                  </div>
                ) : null} */}
                <Form onSubmit={this._handleSubmit}>
                  {!person.name ? (
                    <Form.Field label={intl.formatMessage(messages.nameLabel)}>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={this._handleChange}
                      />
                    </Form.Field>
                  ) : null}
                  <Form.Field label={intl.formatMessage(messages.emailLabel)}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={this._handleChange}
                    />
                  </Form.Field>
                  <Form.Field label={intl.formatMessage(messages.phoneLabel)}>
                    <input
                      type="text"
                      name="cellphone"
                      value={formData.cellphone}
                      onChange={this._handleChange}
                    />
                  </Form.Field>
                  <Form.Field
                    label={intl.formatMessage(messages.birthdayLabel)}
                  >
                    <DatePicker
                      onChange={(date) => {
                        this._handleChange({
                          target: {
                            name: "birthday",
                            value: date,
                          },
                        });
                      }}
                      selected={this.getBirthdayValue()}
                      dateFormatCalendar="MMMM"
                      dateFormat="P"
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                    />
                  </Form.Field>
                  <AddressField
                    name="address"
                    country={campaign.country}
                    value={formData.address}
                    onChange={(target) => this._handleChange({ target })}
                  />
                  {this._hasDonationUrl() ? (
                    <label>
                      <input
                        name="donor"
                        checked={formData.donor}
                        onChange={this._handleChange}
                        type="checkbox"
                      />
                      <FormattedMessage
                        id="app.people_form.donation_label"
                        defaultMessage="I'd like do donate"
                      />
                    </label>
                  ) : null}
                  {this._displayParticipateButton() ? (
                    <Button
                      onClick={(ev) => {
                        ev.preventDefault();
                        this.setState({ contribute: !contribute });
                      }}
                    >
                      <FormattedMessage
                        id="app.people_form.participate_label"
                        defaultMessage="I'd like to participate"
                      />
                    </Button>
                  ) : null}
                  {contribute ? (
                    <div className="contribute">
                      <Form.Field
                        label={intl.formatMessage(messages.skillsLabel)}
                      >
                        <SkillsField
                          name="skills"
                          options={campaign.forms.skills}
                          value={formData.skills || []}
                          onChange={this._handleChange}
                        />
                      </Form.Field>
                      {/* <label>
                        <input
                          type="checkbox"
                          name="supporter"
                          checked={formData.supporter}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.people_form.supporter_label"
                          defaultMessage="If we send you content, will you share in your social networks?"
                        />
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="mobilizer"
                          checked={formData.mobilizer}
                          onChange={this._handleChange}
                        />
                        <FormattedMessage
                          id="app.people_form.mobilizer_label"
                          defaultMessage="Would you produce en event in your neighborhood or workplace?"
                        />
                      </label> */}
                    </div>
                  ) : null}
                  {/* <Divider /> */}
                  {!person.facebookId && recaptchaSiteKey ? (
                    <div className="recaptcha-container">
                      <Recaptcha
                        sitekey={recaptchaSiteKey}
                        render="explicit"
                        verifyCallback={this._handleRecaptcha}
                      />
                      {/* <Divider hidden /> */}
                    </div>
                  ) : null}
                  <p className="policy">
                    <CountryExclusive
                      country="CO"
                      defaultContent={
                        <FormattedHTMLMessage
                          id="app.people_form.privacy_policy"
                          defaultMessage='By submitting this form you agree with our <a href="https://files.liane.cc/legal/privacy_policy_v1_pt-br.pdf" target="_blank" rel="external">Privacy Policy</a>.'
                        />
                      }
                    >
                      <span>
                        Al enviar este formulario autorizas a que tus datos
                        personales sean recolectados y tratados, de conformidad
                        con la política de protección de datos personales del
                        Instituto Update / Extituto de Política Abierta, la cual
                        está disponible en el siguiente enlace:{" "}
                        <a
                          href="https://files.liane.cc/legal/politica_privacidad_extituto_v1.pdf"
                          target="_blank"
                          rel="external"
                        >
                          https://files.liane.cc/legal/politica_privacidad_extituto_v1.pdf
                        </a>
                      </span>
                    </CountryExclusive>
                  </p>
                  <input
                    type="submit"
                    value={intl.formatMessage(messages.sendLabel)}
                  />
                </Form>
              </>
            )}
          </Container>
          <Alerts />
        </>
      );
    } else {
      return (
        <Container id="app">
          {/* <Message
            color="red"
            icon="warning sign"
            header="Invalid request"
            content="Form is not available for this request."
          /> */}
        </Container>
      );
    }
  }
}

PeopleForm.propTypes = {
  intl: intlShape.isRequired,
};

const PeopleFormIntl = injectIntl(PeopleForm);

class IntlContainer extends Component {
  render() {
    const language =
      get(this.props, "campaign.forms.crm.language") ||
      (navigator.languages && navigator.languages[0]) ||
      navigator.language ||
      navigator.userLanguage;

    const findLocale = (language) => {
      let locale = false;
      const languageWRC = language.toLowerCase().split(/[_-]+/)[0];
      for (const key in localeData) {
        let keyWRC = key.toLowerCase().split(/[_-]+/)[0];
        if (
          !locale &&
          (key == language ||
            key == languageWRC ||
            keyWRC == languageWRC ||
            keyWRC == language)
        ) {
          locale = key;
        }
      }
      return locale;
    };
    const locale = findLocale(language);
    updateDepsLocales(locale);
    const localeMessages = localeData[locale] || localeData.en;
    return (
      <IntlProvider locale={language} messages={localeMessages}>
        <PeopleFormIntl {...this.props} />
      </IntlProvider>
    );
  }
}

export default IntlContainer;
