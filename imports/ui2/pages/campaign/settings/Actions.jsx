import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";

export default class CampaignActionsPage extends Component {
  _handleClick = ev => {
    ev.preventDefault();
    const { campaignId } = this.props;
    if (
      confirm(
        "Tem certeza que deseja remover permanentemente a campanha e seus dados?"
      )
    ) {
      Meteor.call("campaigns.remove", { campaignId }, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          FlowRouter.go("App.dashboard");
        }
      });
    }
  };
  render() {
    const { campaign } = this.props;
    if (campaign) {
      return (
        <>
          <Nav />
          <Form onSubmit={ev => ev.preventDefault()}>
            <Form.Content>
              <button className="delete" onClick={this._handleClick}>
                Remover campanha e todos os seus dados
              </button>
              <hr />
              <p>
                <strong>Atenção</strong>: Essa ação é irreversível!
              </p>
            </Form.Content>
          </Form>
        </>
      );
    }
    return null;
  }
}
