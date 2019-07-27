import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { alertStore } from "../containers/Alerts.jsx";

export default class PeopleExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      url: "",
      exportCount: (props.peopleExports && props.peopleExports.length) || 0
    };
  }
  static getDerivedStateFromProps(props, state) {
    if (props.peopleExports && props.peopleExports.length) {
      return {
        exportCount: props.peopleExports.length
      };
    }
    return null;
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.exportCount < this.state.exportCount) {
      this.setState({ url: this.props.peopleExports[0].url });
    }
  }
  _handleClick = ev => {
    const { loading, running, url } = this.state;
    if (loading || running) return false;
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
          }
        }
      );
    }
  };
  _label = () => {
    const { children, running } = this.props;
    const { loading, url } = this.state;
    if (url) {
      return (
        <>
          <FontAwesomeIcon icon="download" />{" "}
          <FormattedMessage
            id="app.people.exports.download"
            defaultMessage="Download file"
          />
        </>
      );
    }
    if (loading || running) {
      return (
        <FormattedMessage
          id="app.people.exports.processing"
          defaultMessage="Processing export..."
        />
      );
    }
    return (
      children || (
        <FormattedMessage
          id="app.people.exports.button_label"
          defaultMessage="Export people"
        />
      )
    );
  };
  render() {
    const { children, ...props } = this.props;
    const { loading, url } = this.state;
    return (
      <a
        href={url || "javascript:void(0);"}
        onClick={this._handleClick}
        target="_blank"
      >
        {this._label()}
      </a>
    );
  }
}
