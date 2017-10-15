import React from "react";
import { ProxiesPackages } from "/imports/api/proxies/proxies.js";
import { Button } from "semantic-ui-react";

export default class ProxiesPackagesUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this._onClick = this._onClick.bind(this);
  }
  _onClick(e) {
    e.preventDefault();
    const { packageId } = this.props;
    this.setState({ loading: true });
    Meteor.call("proxies.updatePackage", { packageId }, (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
      this.setState({ loading: false });
    });
  }

  render() {
    return (
      <Button
        primary
        size="mini"
        onClick={this._onClick}
        loading={this.state.loading}
      >
        Update
      </Button>
    );
  }
}
