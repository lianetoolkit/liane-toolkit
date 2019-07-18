import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Container = styled.ul`
  margin: 0;
  padding: 0 0 2px;
  list-style: none;
  border-radius: 7px;
  border: 1px solid #ccc;
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
      h4 {
        flex: 1 1 100%;
        margin: 0;
        font-size: 1em;
        font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-weight: normal;
      }
      &:focus,
      &:hover {
        background-color: #fff;
        color: #333;
      }
      &:active {
        background-color: #063;
        color: #fff;
      }
    }
    &.selected {
      a {
        background-color: #006633;
        color: #fff;
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

export default class SelectAccount extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      accounts: [],
      selected: []
    };
  }
  static getDerivedStateFromProps({ value }, { selected }) {
    if (value && value.length && !selected.length) {
      return {
        selected: value
      };
    }
    return null;
  }
  _handleClick = account => ev => {
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
        newSelected = selected.filter(aId => aId !== account.id);
      }
    }
    this.setState({
      selected: newSelected
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
          value: multiple ? this.state.selected : this.state.selected[0]
        }
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
            value: multiple ? this.state.selected : this.state.selected[0]
          }
        });
      }
    }
  }
  _isSelected = account => {
    const { selected } = this.state;
    return selected.indexOf(account.id) !== -1;
  };
  render() {
    const { accounts, loading } = this.state;
    if (!loading && !accounts.length) {
      return (
        <Container>
          <p className="not-found">
            Nenhuma página de Facebook foi encontrada para a criação da sua
            campanha.
          </p>
        </Container>
      );
    }
    if (accounts.length) {
      return (
        <Container>
          {accounts.map(account => (
            <li
              key={account.id}
              className={this._isSelected(account) ? "selected" : ""}
            >
              <a
                href="javascript:void(0);"
                onClick={this._handleClick(account)}
              >
                <h4>{account.name}</h4>
                {this._isSelected(account) ? (
                  <FontAwesomeIcon icon="check" />
                ) : null}
              </a>
            </li>
          ))}
        </Container>
      );
    }
    return null;
  }
}
