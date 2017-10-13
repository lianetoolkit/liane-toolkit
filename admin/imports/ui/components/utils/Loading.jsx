import React, { Component } from "react";
import Spinner from "react-spinner";

import "./Loading.less";

export default class Loading extends Component {
  _renderLoadingMessage() {
    if (this.props.text) return this.props.text;
    else return "Loading";
  }

  render() {
    const style = {
      padding: "40px"
    };
    return (
      <div className="loading-spinner" style={style}>
        <Spinner />
      </div>
    );
  }
}
