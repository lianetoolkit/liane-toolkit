import React from "react";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import i18n from "meteor/universe:i18n";
import PropTypes from "prop-types";
import { Alerts } from "/imports/ui/utils/Alerts.js";
import { Form, Dropdown, List, Header } from "semantic-ui-react";
import Loading from "/imports/ui/components/utils/Loading.jsx";
import _ from "underscore";

export default class SelectFacebookAccountField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      loading: true
    };
  }
  componentDidMount() {
    const { selectedAccountsIds } = this.props;
    Meteor.call("facebook.accounts.getUserAccounts", (error, data) => {
      if (error) {
        Alerts.error(error);
      } else {
        const accounts = this._filterAccounts(selectedAccountsIds, data.result);

        this.setState({ accounts: accounts, loading: false });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedAccountsIds != this.props.selectedAccountsIds) {
      const accounts = this._filterAccounts(
        nextProps.selectedAccountsIds,
        this.state.accounts
      );
      this.setState({ accounts: accounts });
    }
  }
  _filterAccounts(selectedAccountsIds, availableAccounts) {
    const accounts = [];
    _.each(availableAccounts, account => {
      if (!_.contains(selectedAccountsIds, account.id)) {
        accounts.push(account);
      }
    });
    return accounts;
  }

  render() {
    const { ...props } = this.props;
    const { accounts, loading } = this.state;
    return (
      <Form.Field
        control={Dropdown}
        name="accounts"
        placeholder="Search a Facebook Account"
        search
        selection
        fluid
        {...props}
        options={accounts.map(account => {
          return {
            key: account.id,
            value: account.id,
            text: account.name
          };
        })}
      />
    );
  }
}
