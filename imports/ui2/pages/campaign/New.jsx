import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage,
} from "react-intl";
import { ClientStorage } from "meteor/ostrio:cstorage";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Form from "../../components/Form.jsx";
import Loading from "../../components/Loading.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";
import CampaignTypeSelect from "../../components/CampaignTypeSelect.jsx";
import OfficeField from "../../components/OfficeField.jsx";
import CountrySelect from "../../components/CountrySelect.jsx";
import GeolocationSearch from "../../components/GeolocationSearch.jsx";
import UserUpgrade from "../../components/UserUpgrade.jsx";

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
    defaultMessage: "Candidacy name",
  },
  partyLabel: {
    id: "app.campaign.form.party.label",
    defaultMessage: "Party, movement or coalition your candidacy is part of",
  },
  partyPlaceholder: {
    id: "app.campaign.form.party.placeholder",
    defaultMessage: "Party/movement/coalition",
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
});

class NewCampaignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value,
      },
    });
  };
  _filledForm = () => {
    const { formData } = this.state;
    const defaultValidation =
      formData.name &&
      formData.type &&
      formData.country &&
      formData.facebookAccountId &&
      formData.geolocation &&
      formData.geolocation.osm_id;

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
  render() {
    const { intl } = this.props;
    const { ready, validation, loading, formData } = this.state;
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
        <Form.Content>
          {loading ? <Loading full /> : null}
          <Page.Title>
            <FormattedMessage
              id="app.title.new_campaign"
              defaultMessage="Creating new campaign"
            />
          </Page.Title>
          <Form.Field label={intl.formatMessage(messages.nameLabel)}>
            <input
              type="text"
              name="name"
              placeholder={intl.formatMessage(messages.namePlaceholder)}
              onChange={this._handleChange}
              value={formData.name}
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
          {formData.type.match(/electoral|mandate/) ? (
            <>
              <Form.Field label={intl.formatMessage(messages.candidateLabel)}>
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
                  placeholder={intl.formatMessage(messages.partyPlaceholder)}
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
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            disabled={!this._filledForm() || loading}
            value={intl.formatMessage(messages.submitLabel)}
          />
        </Form.Actions>
      </Form>
    );
  }
}

NewCampaignPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(NewCampaignPage);
