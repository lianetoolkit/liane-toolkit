import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";

import Select from "react-select";

import Nav from "./Nav.jsx";
import Table from "../../../components/Table.jsx";
import Form from "../../../components/Form.jsx";
import CountrySelect from "../../../components/CountrySelect.jsx";
import GeolocationSearch from "../../../components/GeolocationSearch.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";
import { messages as officeMessages } from "../../../components/OfficeField.jsx";
import { messages as campaignTypeMessages } from "../../../components/CampaignTypeSelect.jsx";

import { languages } from "/locales";

const messages = defineMessages({
  nameLabel: {
    id: "app.campaign_settings.name_label",
    defaultMessage: "Campaign name",
  },
  typeLabel: {
    id: "app.campaign_settings.type_label",
    defaultMessage: "Type",
  },
  candidateLabel: {
    id: "app.campaign_settings.candidate_label",
    defaultMessage: "Candidate",
  },
  partyLabel: {
    id: "app.campaign_settings.party_label",
    defaultMessage: "Party/movement/coalition",
  },
  officeLabel: {
    id: "app.campaign_settings.office_label",
    defaultMessage: "Office",
  },
  causeLabel: {
    id: "app.campaign_settings.cause_label",
    defaultMessage: "Cause",
  },
  countryLabel: {
    id: "app.campaign_settings.country_label",
    defaultMessage: "Country",
  },
  regionLabel: {
    id: "app.campaign_settings.region_label",
    defaultMessage: "Region",
  },
  locationLabel: {
    id: "app.campaign_settings.location_label",
    defaultMessage: "Location",
  },
  emailLabel: {
    id: "app.campaign_settings.email_label",
    defaultMessage: "Public email",
  },
  phoneLabel: {
    id: "app.campaign_settings.phone_label",
    defaultMessage: "Public phone number",
  },
  saveLabel: {
    id: "app.campaign_settings.save",
    defaultMessage: "Save",
  },
});

class CampaignSettingsPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      changeGeolocation: false,
      loading: false,
      formData: {
        campaignId: "",
        name: "",
        contact: {},
      },
    };
  }
  static getDerivedStateFromProps({ campaign }, { formData }) {
    if (!campaign) {
      return {
        formData: {
          campaignId: "",
          name: "",
          candidate: "",
          party: "",
          cause: "",
          country: "",
          contact: {},
        },
      };
    } else if (campaign._id !== formData.campaignId) {
      return {
        formData: {
          campaignId: campaign._id,
          name: campaign.name,
          candidate: campaign.candidate,
          party: campaign.party,
          cause: campaign.cause,
          country: campaign.country,
          contact: campaign.contact,
        },
      };
    }
    return null;
  }
  _filledForm = () => {
    const { formData } = this.state;
    return formData.campaignId && formData.name;
  };
  _handleGeolocationChangeClick = (ev) => {
    ev.preventDefault();
    this.setState({
      changeGeolocation: !this.state.changeGeolocation,
    });
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
      this.setState({ loading: true });
      Meteor.call("campaigns.update", formData, (err, data) => {
        if (!err) {
          alertStore.add("Updated", "success");
        } else {
          alertStore.add(err);
        }
        this.setState({ loading: false });
      });
    }
  };
  getValue = (key) => {
    const { formData } = this.state;
    return get(formData, key);
  };
  _officeLabel = (office) => {
    const { intl } = this.props;
    if (officeMessages[office])
      return intl.formatMessage(officeMessages[office]);
    return office;
  };
  _typeLabel = (type) => {
    const { intl } = this.props;
    if (campaignTypeMessages[type])
      return intl.formatMessage(campaignTypeMessages[type]);
    return type;
  };
  render() {
    const { intl, campaign } = this.props;
    const { loading, changeGeolocation, active, formData } = this.state;
    return (
      <>
        <Nav campaign={campaign} />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <Table>
              <tbody>
                <tr>
                  <th>{intl.formatMessage(messages.typeLabel)}</th>
                  <td className="fill">{this._typeLabel(campaign.type)}</td>
                </tr>
                <tr>
                  <th>{intl.formatMessage(messages.locationLabel)}</th>
                  <td className="fill">
                    {campaign.geolocation.name} - {campaign.country}
                  </td>
                </tr>
                {campaign.type.match(/electoral|mandate/) ? (
                  <tr>
                    <th>{intl.formatMessage(messages.officeLabel)}</th>
                    <td className="fill">
                      {this._officeLabel(campaign.office)}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
            <hr />
            <Form.Field label={intl.formatMessage(messages.nameLabel)} big>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder={intl.formatMessage(messages.nameLabel)}
                onChange={this._handleChange}
              />
            </Form.Field>
            {campaign.type.match(/electoral|mandate/) ? (
              <>
                <Form.Field label={intl.formatMessage(messages.candidateLabel)}>
                  <input
                    type="text"
                    name="candidate"
                    value={formData.candidate}
                    onChange={this._handleChange}
                  />
                </Form.Field>
                <Form.Field label={intl.formatMessage(messages.partyLabel)}>
                  <input
                    type="text"
                    name="party"
                    value={formData.party}
                    onChange={this._handleChange}
                  />
                </Form.Field>
              </>
            ) : null}
            {campaign.type.match(/mobilization/) ? (
              <Form.Field label={intl.formatMessage(messages.causeLabel)}>
                <input
                  type="text"
                  name="cause"
                  value={formData.cause}
                  onChange={this._handleChange}
                />
              </Form.Field>
            ) : null}
            <h3>
              <FormattedMessage
                id="app.campaign_settings.contact_title"
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
            <h3>
              <FormattedMessage
                id="app.campaign_settings.geolocation_title"
                defaultMessage="Geolocation"
              />
            </h3>
            {!changeGeolocation ? (
              <p>
                {campaign.geolocation.osm.display_name}.{" "}
                <a href="#" onClick={this._handleGeolocationChangeClick}>
                  <FormattedMessage
                    id="app.campaign_settings.change_label"
                    defaultMessage="Click here to change"
                  />
                </a>
                .
              </p>
            ) : (
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
            )}
          </Form.Content>
          <Form.Actions>
            <input
              type="submit"
              disabled={!this._filledForm() || loading}
              value={intl.formatMessage(messages.saveLabel)}
            />
          </Form.Actions>
        </Form>
      </>
    );
  }
}

CampaignSettingsPage.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(CampaignSettingsPage);
