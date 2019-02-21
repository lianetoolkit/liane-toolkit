import React, { Component } from "react";

import Page from "../../components/Page.jsx";
import Form from "../../components/Form.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";

export default class NewCampaignPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
    return formData.name && formData.facebookAccountId;
  };
  _handleSubmit = ev => {
    ev.preventDefault();
    if (this._filledForm()) {
      const { formData } = this.state;
      Meteor.call("campaigns.create", formData, (err, data) => {
        console.log(err);
        console.log(data);
      });
    } else {
      console.log("nope");
    }
  };
  render() {
    const { formData } = this.state;
    return (
      <Form onSubmit={this._handleSubmit}>
        <Form.Content>
          <Page.Title>Criando Nova Campanha</Page.Title>
          <input
            type="text"
            name="name"
            placeholder="Campaign name"
            onChange={this._handleChange}
            value={formData.name}
          />
          <p>Selecione uma conta de Facebook para sua campanha:</p>
          <SelectAccount
            name="facebookAccountId"
            onChange={this._handleChange}
            value={formData.facebookAccountId}
          />
        </Form.Content>
        <Form.Actions>
          <input
            type="submit"
            disabled={!this._filledForm()}
            value="Cadastrar campanha"
          />
        </Form.Actions>
      </Form>
    );
  }
}
