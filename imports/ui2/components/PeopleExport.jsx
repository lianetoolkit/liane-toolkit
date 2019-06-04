import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { alertStore } from "../containers/Alerts.jsx";

export default class PeopleExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      url: ""
    };
  }
  _handleClick = ev => {
    const { loading, url } = this.state;
    if (loading) return false;
    if (!url) {
      ev.preventDefault();
      const { query, options } = this.props;
      const campaignId = Session.get("campaignId");
      this.setState({ loading: true });
      Meteor.call(
        "people.export",
        { campaignId, rawQuery: query, options },
        (err, res) => {
          this.setState({ loading: false });
          if (err) {
            alertStore.add(err);
          } else {
            this.setState({ url: res });
          }
        }
      );
    }
  };
  _label = () => {
    const { children } = this.props;
    const { loading, url } = this.state;
    if (url) {
      return (
        <>
          <FontAwesomeIcon icon="download" /> Baixar arquivo
        </>
      );
    }
    if (loading) {
      return "Gerando arquivo...";
    }
    return children || "Exportar pessoas";
  };
  render() {
    const { children, ...props } = this.props;
    const { loading, url } = this.state;
    return (
      <a href={url || "javascript:void(0);"} onClick={this._handleClick}>
        {this._label()}
      </a>
    );
  }
}
