import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Loading from "../Loading.jsx";

const Container = styled.ul`
  margin: 0 0 2rem;
  padding: 0 0 2px;
  list-style: none;
  border-radius: 7px;
  border: 1px solid #ddd;
  li {
    margin: 2px 2px 0;
    padding: 0;
    a {
      padding: 0.8rem 1.2rem;
      border-radius: 7px;
      margin: 0;
      color: #666;
      display: flex;
      align-items: center;
      text-decoration: none;
      cursor: default;
      > h4 {
        flex: 1 1 100%;
        margin: 0;
        font-size: 1em;
        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-weight: normal;
      }
      > span {
        flex: 0 0 auto;
        font-size: 0.8em;
      }
    }
    &.disabled {
      a > span {
        color: #999;
      }
    }
    &:not(.disabled) {
      a {
        cursor: pointer;
      }
      a:focus,
      a:hover {
        background-color: #fff;
        color: #333;
      }
      a:active {
        background-color: #f9ae3b;
        color: #fff;
      }
      &.selected {
        a {
          background-color: #f9ae3b;
          color: #fff;
        }
      }
    }
  }
  .not-found {
    color: #999;
    font-style: italic;
    margin: 0;
    padding: 0.8rem 1.2rem;
  }
`;

function AccountItem({ account, selected, onClick }) {
  const disabled = account?.tasks?.indexOf("MANAGE") == -1;
  let className = "";
  if (selected) className += " selected";
  if (disabled) className += " disabled";
  return (
    <li className={className}>
      <a
        href="#"
        onClick={
          disabled
            ? (ev) => {
                ev.preventDefault();
              }
            : onClick
        }
      >
        <h4>{account.name}</h4>
        <span>
          {selected ? <FontAwesomeIcon icon="check" /> : null}
          {disabled ? (
            <>
              <FormattedMessage
                id="app.account_select.disabled_label"
                defaultMessage="You are not an administrator"
              />{" "}
              <FontAwesomeIcon icon="ban" />
            </>
          ) : null}
        </span>
      </a>
    </li>
  );
}

export default class SelectAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      accounts: [],
      selected: [],
    };
  }
  static getDerivedStateFromProps({ value }, { selected }) {
    if (value && value.length && !selected.length) {
      return {
        selected: value,
      };
    }
    return null;
  }
  _handleClick = (account) => (ev) => {
    const { multiple } = this.props;
    const { selected } = this.state;
    ev.preventDefault();
    let newSelected;
    if (!multiple) {
      newSelected = [account.id];
    } else {
      if (selected.indexOf(account.id) == -1) {
        newSelected = [...selected, account.id];
      } else {
        newSelected = selected.filter((aId) => aId !== account.id);
      }
    }
    this.setState({
      selected: newSelected,
    });
  };
  componentDidMount() {
    const { multiple } = this.props;
    this.setState({ loading: true });
    Meteor.call("facebook.accounts.getUserAccounts", (error, data) => {
      if (error) {
        console.log(error);
      } else {
        this.setState({ accounts: data.result, loading: false });
      }
    });
    if (this.state.selected.length && this.props.onChange) {
      this.props.onChange({
        target: {
          name: this.props.name,
          value: multiple ? this.state.selected : this.state.selected[0],
        },
      });
    }
  }
  componentDidUpdate(prevProps, { selected }) {
    const { multiple } = this.props;
    if (selected !== this.state.selected) {
      if (this.props.onChange) {
        this.props.onChange({
          target: {
            name: this.props.name,
            value: multiple ? this.state.selected : this.state.selected[0],
          },
        });
      }
    }
  }
  _isSelected = (account) => {
    const { selected } = this.state;
    return selected.indexOf(account.id) !== -1;
  };
  render() {
    const { accounts, loading } = this.state;
    if (loading) {
      return <Loading />;
    }
    if (!loading && !accounts.length) {
      return (
        <Container>
          <p className="not-found">
            No Facebook page was found. You must have a Facebook page to create
            a campaign.
          </p>
        </Container>
      );
    }
    if (accounts.length) {
      return (
        <Container>
          {accounts.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              selected={this._isSelected(account)}
              onClick={this._handleClick(account)}
            />
          ))}
        </Container>
      );
    }
    return null;
  }
}
