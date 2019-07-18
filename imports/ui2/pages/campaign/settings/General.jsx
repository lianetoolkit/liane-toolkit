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
          alertStore.add("Campanha atualizada", "success");
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
    const { active, formData } = this.state;
    return (
      <>
        <Nav />
        <Form onSubmit={this._handleSubmit}>
          <Form.Content>
            <Form.Field label="Nome da campanha" big>
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Nome da campanha"
                onChange={this._handleChange}
              />
            </Form.Field>
            <h3>Configurações do formulário</h3>
            <p>
              Utilize o formulário de CRM para convidar seu público a fazer
              parte da sua campanha! Além do link abaixo, há também um link
              exclusivo para cada pessoa existente na sua base de dados,
              facilitando a integração dos dados.
            </p>
            <PersonFormInfo />
            <Form.Field
              label="Configurar caminho de url do formulário"
              prefix={FlowRouter.url("")}
            >
              <input
                type="text"
                placeholder="MinhaCampanha"
                name="forms.slug"
                value={this.getValue("forms.slug")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Título para o formulário">
              <input
                type="text"
                name="forms.crm.header"
                value={this.getValue("forms.crm.header")}
                onChange={this._handleChange}
              />
            </Form.Field>
            <Form.Field label="Texto de apresentação do formulário">
              <textarea
                name="forms.crm.text"
                value={this.getValue("forms.crm.text")}
                onChange={this._handleChange}
              />
            </Form.Field>
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
