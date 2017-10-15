import React from "react";
import { Button, Select, Input } from "semantic-ui-react";
import { ProxiesPackages } from "/imports/api/proxies/proxies.js";

const options = [
  { key: "myprivateproxy", text: "My Private Proxy", value: "myprivateproxy" }
];

export default class AddProxiesPackages extends React.Component {
  constructor(props) {
    super(props);
    this.state = this._getInitialState();
    this._onSubmit = this._onSubmit.bind(this);
    this._handleChange = this._handleChange.bind(this);
  }
  _getInitialState() {
    return {
      packageId: "",
      provider: "myprivateproxy",
      loading: false
    };
  }
  _handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  };

  _onSubmit(e) {
    e.preventDefault();
    const { packageId, provider } = this.state;
    if (!packageId) {
      return;
    }
    this.setState({ loading: true });
    Meteor.call(
      "proxies.addPackage",
      { packageId, provider },
      (error, data) => {
        if (error) {
          console.log(error);
        } else {
          console.log(data);
        }
        this.setState({ loading: false });
      }
    );
  }

  render() {
    return (
      <Input
        type="text"
        name="packageId"
        onChange={this._handleChange}
        placeholder="Enter package Id"
        action
        value={this.state.packageId}
      >
        <input />
        <Select
          compact
          options={options}
          defaultValue={this.state.provider}
          name="provider"
          onChange={this._handleChange}
        />
        <Button
          type="submit"
          primary
          onClick={this._onSubmit}
          loading={this.state.loading}
        >
          Add Package
        </Button>
      </Input>
    );
  }
}
