import React from "react";
import { Header, Form, Dropdown } from "semantic-ui-react";

export default class FacebookAccountField extends React.Component {
  static defaultProps = {
    value: ""
  };
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      availableAccounts: [],
      value: ""
    };
  }
  componentDidMount() {
    if (this.props.value) {
      this._updateAvailableFBAccounts(this.props.value);
      this.setState({
        value: this._parseValueInput(this.props.value)
      });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this._updateAvailableFBAccounts(nextProps.value);
      this.setState({
        value: this._parseValueInput(nextProps.value)
      });
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const { value } = this.state;
    const { name, onChange } = this.props;
    if (JSON.stringify(prevState.value) != JSON.stringify(value) && onChange) {
      onChange(null, { name, value: this._parseValueOutput(value) });
    }
  }
  _parseValueInput(value) {
    if (!value) return "";
    if (Array.isArray(value)) {
      return value.map(item => JSON.stringify(item));
    } else {
      return JSON.stringify(value);
    }
  }
  _parseValueOutput(value) {
    if (Array.isArray(value)) {
      return value.map(item => JSON.parse(item));
    } else {
      return JSON.parse(value);
    }
  }
  _searchFBAccounts = _.debounce((ev, data) => {
    if (data.searchQuery) {
      Meteor.call(
        "facebook.accounts.search",
        { q: data.searchQuery },
        (error, res) => {
          if (error) {
            console.log(error);
          } else {
            this._updateAvailableFBAccounts(res.data);
          }
        }
      );
    }
  }, 200);
  _updateAvailableFBAccounts(data = []) {
    if (!Array.isArray(data)) {
      data = [data];
    }
    if (data.length) {
      let availableAccounts = {};
      data.forEach(account => {
        let str = JSON.stringify(account);
        availableAccounts[account.id] = {
          key: account.id,
          value: str,
          text: account.name,
          content: this._getContent(account)
        };
      });
      this.setState({
        availableAccounts: Object.assign(
          {},
          this.state.availableAccounts,
          availableAccounts
        )
      });
    }
  }
  _getContent(account) {
    return (
      <div>
        <Header
          content={account.name}
          subheader={`${account.fan_count} fans`}
        />
        <p>{account.link}</p>
        <p>{account.website}</p>
      </div>
    );
  }
  _handleChange = (e, { name, value }) => this.setState({ value });
  render() {
    const { multiple, label } = this.props;
    let { value } = this.state;
    const { availableAccounts } = this.state;
    const accountsOptions = Object.values(availableAccounts);
    if (multiple) {
      if (value && !Array.isArray(value)) {
        value = [value];
      } else if (!value) {
        value = [];
      }
    }
    return (
      <Form.Field
        control={Dropdown}
        multiple={multiple || false}
        selection
        search
        fluid
        label={label || "Facebook account"}
        placeholder="Search a Facebook Account"
        options={accountsOptions}
        value={value}
        onSearchChange={this._searchFBAccounts}
        onChange={this._handleChange}
      />
    );
  }
}
