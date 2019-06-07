import React, { Component } from "react";

import { alertStore } from "../../../containers/Alerts.jsx";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";

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
          name: ""
        }
      };
    } else if (campaign._id !== formData.campaignId) {
      return {
        formData: {
          campaignId: campaign._id,
          name: campaign.name
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
    this.setState({
      formData: {
        ...this.state.formData,
        [target.name]: target.value
      }
    });
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      Meteor.call("campaigns.update", formData, (err, data) => {
        if (!err) {
          console.log(err);
        } else {
          alertStore.add("Campanha atualizada", "success");
        }
      });
    }
  };
  render() {
    const { active, formData } = this.state;
    return (
      <>
        <Nav />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Nome da campanha"
              onChange={this._handleChange}
            />
          </Form.Content>
          <Form.Actions>
            <input
              type="submit"
              disabled={!this._filledForm()}
              value="Atualizar campanha"
            />
          </Form.Actions>
        </Form>
      </>
    );
  }
}
