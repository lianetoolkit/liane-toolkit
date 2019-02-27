import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";

export default class CampaignAccountsPage extends Component {
  _handleSubmit = ev => {
    ev.preventDefault();
  };
  render() {
    return (
      <>
        <Nav />
        <Form onSubmit={this._handleSubmit} />
      </>
    );
  }
}
