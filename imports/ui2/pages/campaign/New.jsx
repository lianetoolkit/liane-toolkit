import React, { Component } from "react";

import Page from "../../components/Page.jsx";
import Form from "../../components/Form.jsx";
import SelectAccount from "../../components/facebook/SelectAccount.jsx";

export default class NewCampaignPage extends Component {
  render() {
    return (
      <Page.Content>
        <Page.Title>Criando Nova Campanha</Page.Title>
        <Form>
          <input type="text" placeholder="Campaign name" />
          <p>Selecione uma conta de Facebook para sua campanha:</p>
          <SelectAccount />
        </Form>
      </Page.Content>
    );
  }
}
