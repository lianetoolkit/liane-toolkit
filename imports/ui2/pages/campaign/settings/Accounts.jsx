import React, { Component } from "react";

import Nav from "./Nav.jsx";
import Form from "../../../components/Form.jsx";
import SelectAccount from "../../../components/facebook/SelectAccount.jsx";

export default class CampaignAccountsPage extends Component {
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
    if (formData.accounts && formData.accounts.length) {
      Meteor.call(
        "campaigns.updateAccounts",
        {
          campaignId,
          accounts: formData.accounts
        },
        (err, data) => {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        }
      );
    }
  };
  render() {
    const { campaign } = this.props;
    if (campaign) {
      const accounts = campaign.accounts || [];
      return (
        <>
          <Nav />
          <Form onSubmit={this._handleSubmit}>
            <Form.Content>
              <p>
                Altere quais páginas de Facebook serão utilizadas pela sua
                campanha
              </p>
              <SelectAccount
                multiple={true}
                name="accounts"
                value={accounts.map(a => a.facebookId)}
                onChange={this._handleChange}
              />
            </Form.Content>
            <Form.Actions>
              <input type="submit" value="Atualizar contas" />
            </Form.Actions>
          </Form>
        </>
      );
    }
    return null;
  }
}
