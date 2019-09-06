import React, { Component } from "react";

let userCountry = "";
Meteor.call("users.getCountry", (err, res) => {
  if (!err) {
    userCountry = res;
  }
});

export default class CountryExclusive extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    if (userCountry) {
      this.setState({ userCountry });
    } else {
      Meteor.call("users.getCountry", (err, res) => {
        this.setState({ userCountry: res });
        userCountry = res;
      });
    }
  }
  render() {
    const { country, defaultContent, children } = this.props;
    if (country == this.state.userCountry) return children;
    if (defaultContent) return defaultContent;
    return null;
  }
}
