import React, { Component } from "react";

import Page from "../../components/Page.jsx";
import Form from "../../components/Form.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";

export default class NewCampaignPage extends Component {
  render() {
    return (
      <Form>
        <Form.Content>
          <Page.Title>Criando Nova Campanha</Page.Title>
          <input type="text" placeholder="Campaign name" />
          <p>Selecione uma conta de Facebook para sua campanha:</p>
          <SelectAccount />
        </Form.Content>
        <Form.Actions>
          <button>Next</button>
        </Form.Actions>
      </Form>
    );
  }
}
