import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  border-radius: 1.625rem;
  border: 1px solid #ccc;
  li {
    cursor: pointer;
    padding: 1rem 1.5rem;
    border-radius: 1.5rem;
    margin: 0;
    color: #666;
    display: flex;
    align-items: center;
    h3 {
      flex: 1 1 100%;
      margin: 0;
      font-size: 1em;
      font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-weight: normal;
    }
    &:hover {
      background-color: #fff;
      color: #333;
    }
    &.selected {
      background-color: #006633;
      color: #fff;
    }
  }
`;

export default class SelectAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      accounts: []
    };
  }
  _handleClick = account => ev => {
    ev.preventDefault();
    this.setState({
      selected: account.id
    });
    if (this.props.onSelect) {
      this.props.onSelect(account);
    }
  };
  componentDidMount() {
    this.setState({ loading: true });
    Meteor.call("facebook.accounts.getUserAccounts", (error, data) => {
      if (error) {
        console.log(error);
        // Alerts.error(error);
      } else {
        this.setState({ accounts: data.result, loading: false });
      }
    });
  }
  _isSelected = account => {
    const { selected } = this.state;
    return account.id == selected;
  };
  render() {
    const { accounts } = this.state;
    if (accounts.length) {
      return (
        <Container>
          {accounts.map(account => (
            <li
              key={account.id}
              className={this._isSelected(account) ? "selected" : ""}
              onClick={this._handleClick(account)}
            >
              <h3>{account.name}</h3>
              {this._isSelected(account) ? (
                <FontAwesomeIcon icon="check" />
              ) : null}
            </li>
          ))}
        </Container>
      );
    }
    return null;
  }
}
