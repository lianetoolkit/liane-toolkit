import React from "react";
import { Menu, Dropdown, Icon } from "semantic-ui-react";

export default class AccountsMenu extends React.Component {
  constructor(props) {
    super(props);
  }
  _options(accounts, onClick, selected) {
    let options = [];
    for (let acc of accounts) {
      options.push({
        key: acc.facebookId,
        text: acc.name,
        value: acc.facebookId,
        onClick: onClick,
        selected: acc.facebookId == selected
      });
    }
    return options;
  }
  _text(accounts, selected) {
    let text = "Select a facebook account";
    if (accounts && accounts.length && selected) {
      const account = accounts.find(acc => acc.facebookId == selected);
      if (account && account.name) text = account.name;
    }
    return text;
  }
  render() {
    const { accounts, onClick, selected, ...props } = this.props;
    if (accounts && accounts.length) {
      if (accounts.length > 1) {
        return (
          <Dropdown
            key={selected}
            {...props}
            trigger={
              <span>
                <Icon name="facebook" /> {this._text(accounts, selected)}
              </span>
            }
            options={this._options(accounts, onClick, selected)}
          />
        );
      } else {
        return (
          <Menu.Item active>
            <Icon name="facebook" /> {accounts[0].name}
          </Menu.Item>
        );
      }
    } else {
      return null;
    }
  }
}
