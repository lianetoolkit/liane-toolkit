import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import { List } from "semantic-ui-react";
import Loading from "/imports/ui/components/utils/Loading.jsx";

class FacebookAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
    this._handleSelect = this._handleSelect.bind(this);
  }
  _handleSelect(e) {
    const { account, campaignId } = this.props;
    this.setState({ isLoading: true });
    Meteor.call(
      "campaigns.addSelfAccount",
      { campaignId, account },
      (error, data) => {
        this.setState({ isLoading: false });
        if (error) {
          Alerts.error(error);
        } else {
          Alerts.success("Account was successfully added");
        }
      }
    );
  }
  render() {
    const { account } = this.props;
    const { isLoading } = this.state;
    return (
      <List.Item onClick={this._handleSelect} disabled={isLoading}>
        <List.Icon
          name={isLoading ? "spinner" : "facebook square"}
          loading={isLoading}
        />
        <List.Content>
          <List.Header>{account.name}</List.Header>
          {account.category}
        </List.Content>
      </List.Item>
    );
  }
}

export default class SelectFacebookAccount extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: []
    };
  }
  componentDidMount() {
    Meteor.call("facebook.accounts.getUserAccounts", (error, data) => {
      if (error) {
        Alerts.error(error);
      } else {
        this.setState({ accounts: data.result });
      }
    });
  }

  render() {
    const { campaignId } = this.props;
    const { accounts } = this.state;
    return (
      <div>
        {accounts.length ? (
          <List selection verticalAlign="middle">
            {accounts.map(account => (
              <FacebookAccount
                key={account.id}
                account={account}
                campaignId={campaignId}
              />
            ))}
          </List>
        ) : (
          <Loading />
        )}
      </div>
    );
  }
}
