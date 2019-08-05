import React, { Component } from "react";

import { alertStore } from "../../../containers/Alerts.jsx";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import Button from "../../../components/Button.jsx";
import SelectAccount from "../../../components/facebook/SelectAccount.jsx";

export default class CampaignFacebookPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formData: {
        accounts: []
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
  _handleSubmit = ev => {
    ev.preventDefault();
    const { campaignId } = this.props;
    const { formData } = this.state;
  };
  _handleSubscriptionClick = ev => {
    ev.preventDefault();
    const { campaign } = this.props;
    Meteor.call(
      "accounts.updateFBSubscription",
      { campaignId: campaign._id },
      (err, res) => {
        if (err) {
          alertStore.add(err);
        } else {
          alertStore.add("Atualizado", "success");
        }
      }
    );
  };
  render() {
    const { campaign } = this.props;
    if (campaign) {
      const accounts = campaign.accounts || [];
      return (
        <>
          <Nav campaign={campaign} />
          <Form onSubmit={this._handleSubmit}>
            <Form.Content>
              <p>
                Verifique a saúde da conexão da sua página com a nossa
                plataforma
              </p>
              <p>
                <Button onClick={this._handleSubscriptionClick}>
                  Atualizar assinatura de dados
                </Button>
              </p>
              {/* <SelectAccount
                multiple={true}
                name="accounts"
                value={accounts.map(a => a.facebookId)}
                onChange={this._handleChange}
              /> */}
            </Form.Content>
            {/* <Form.Actions>
              <input type="submit" value="Atualizar contas" />
            </Form.Actions> */}
          </Form>
        </>
      );
    }
    return null;
  }
}
