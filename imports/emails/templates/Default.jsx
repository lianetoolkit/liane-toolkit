import React, { Component } from "react";
import Email from "../components/Email.jsx";

class DefaultEmail extends Component {
  render() {
    const { title, data } = this.props;
    return <Email>{data}</Email>;
  }
}

export default DefaultEmail;
