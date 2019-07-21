import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
  FormattedHTMLMessage
} from "react-intl";

import { alertStore } from "../../containers/Alerts.jsx";

import Page from "../../components/Page.jsx";
import Form from "../../components/Form.jsx";
import Loading from "../../components/Loading.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";
import CountrySelect from "../../components/CountrySelect.jsx";
import GeolocationSelect from "../../components/GeolocationSelect.jsx";

const messages = defineMessages({
  nameLabel: {
    id: "app.campaign.form.name.label",
    defaultMessage: "Define a name for your campaign"
  },
  namePlaceholder: {
    id: "app.campaign.form.name.placeholder",
    defaultMessage: "Campaign name"
  },
  countryLabel: {
    id: "app.campaign.form.country.label",
    defaultMessage: "Select the country for your campaign"
  },
  submitLabel: {
    id: "app.campaign.form.submit",
    defaultMessage: "Register campaign"
  }
});

class NewCampaignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      formData: {
        name: "",
        facebookAccountId: ""
      }
    };
  }
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
      formData.facebookAccountId &&
      formData.geolocation &&
      formData.geolocation.osm_id
    );
  };
  _handleGeolocationChange = ({ geolocation, type }) => {
    if (geolocation) {
      this.setState({
        formData: {
          ...this.state.formData,
          geolocation: {
            type,
            osm_id: geolocation.osm_id,
            osm_type: geolocation.osm_type
          }
        }
      });
    } else {
      this.setState({
        formData: {
          ...this.state.formData,
          geolocation: {}
        }
      });
    }
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      this.setState({
        loading: true
      });
      Meteor.call("campaigns.create", formData, (err, data) => {
        if (err) {
          alertStore.add(err);
          this.setState({
            loading: false
          });
        } else {
          Session.set("campaignId", data.result);
          FlowRouter.go("App.dashboard");
          window.location.reload();
        }
      });
    } else {
      alertStore.add(
        "Você deve preencher todos os campos obrigatórios",
        "error"
      );
    }
  };
  render() {
    const { intl } = this.props;
    const { loading, formData } = this.state;
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
          <Form.Field label={intl.formatMessage(messages.countryLabel)}>
            <CountrySelect
              name="country"
              value={formData.country}
              onChange={this._handleChange}
            />
          </Form.Field>
          {formData.country ? (
            <GeolocationSelect
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
  intl: intlShape.isRequired
};

export default injectIntl(NewCampaignPage);
