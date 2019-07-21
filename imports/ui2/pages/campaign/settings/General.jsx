import React, { Component } from "react";
import { get, set } from "lodash";

import { alertStore } from "../../../containers/Alerts.jsx";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import PersonFormInfo from "../../../components/PersonFormInfo.jsx";

export default class CampaignSettingsPage extends Component {
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
  render() {
    const { campaign } = this.props;
    const { active, formData } = this.state;
    return (
      <>
        <Nav campaign={campaign} />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <Form.Field label="Campaign name" big>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Campaign name"
                onChange={this._handleChange}
              />
            </Form.Field>
            <h3>Form settings</h3>
            <p>
              Use the form to invite your audience to your campaign! Besides the
              link below, there's also an exclusive link for each person in your
              directory, improving data integration.
            </p>
            <PersonFormInfo />
            <Form.Field label="Set form url path" prefix={FlowRouter.url("")}>
              <input
                type="text"
                placeholder="MyCampaign"
                name="forms.slug"
                value={this.getValue("forms.slug")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Form title">
              <input
                type="text"
                name="forms.crm.header"
                value={this.getValue("forms.crm.header")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Form presentation text">
              <textarea
                name="forms.crm.text"
                value={this.getValue("forms.crm.text")}
                onChange={this._handleChange}
              />
            </Form.Field>
          </Form.Content>
          <Form.Actions>
            <input type="submit" disabled={!this._filledForm()} value="Save" />
          </Form.Actions>
        </Form>
      </>
    );
  }
}
