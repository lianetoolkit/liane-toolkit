import React, { Component } from "react";
import {
  injectIntl,
  intlShape,
  defineMessages,
  FormattedMessage,
} from "react-intl";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { getFormUrl } from "/imports/ui2/utils/people";
import CopyToClipboard from "./CopyToClipboard.jsx";

import { alertStore } from "../containers/Alerts.jsx";

const messages = defineMessages({
  filledFormLabel: {
    id: "app.form_info.filled_form_label",
    defaultMessage: "Filled form",
  },
  hasntFilledFormLabel: {
    id: "app.form_info.has_filled_form_label",
    defaultMessage: "Hasn't filled form",
  },
  copy: {
    id: "app.form_info.copy_link_label",
    defaultMessage: "Copy link",
  },
  view: {
    id: "app.form_info.view_label",
    defaultMessage: "View form",
  },
  generate: {
    id: "app.form_info.generate_label",
    defaultMessage: "Generate new URL",
  },
});

const Container = styled.div`
  width: 100%;
  display: flex;
  font-size: 0.8em;
  align-items: stretch;
  background: #f0f0f0;
  border-radius: 7px;
  border: 1px solid #ddd;
  margin: 0 0 2rem;
  .fa-align-left {
    font-size: 1.2em;
    margin: 0 1rem 0;
  }
  label {
    flex: 1 1 100%;
    display: flex;
    align-items: center;
    margin: 0;
    font-weight: 400;
    span {
      flex: 0 0 auto;
      font-size: 0.8em;
      padding: 0 1rem 0 0;
    }
    input {
      background: #f0f0f0;
      flex: 1 1 100%;
      margin: 0;
      border-radius: 0;
      border: 0;
      border-left: 1px solid #ddd;
    }
  }
  .actions {
    background: #fff;
    border-radius: 0 7px 7px 0;
    display: flex;
    align-items: center;
    a {
      padding: 0.5rem 1rem;
      border-left: 1px solid #ddd;
      &:first-child {
        border-left: 0;
      }
    }
  }
  ${(props) =>
    props.simple &&
    css`
      font-size: 0.8em;
      margin: 0 0 1rem;
      .fa-align-left {
        font-size: 0.9em;
      }
      input[type="text"] {
        padding: 0.5rem;
      }
      .actions a {
        padding: 0.25rem 0.5rem;
      }
    `}
  ${(props) =>
    props.filled &&
    css`
      background: #f5911e;
      color: #fff;
    `}
  ${(props) =>
    props.loading &&
    css`
      input {
        color: #aaa;
      }
    `}
`;

class PersonFormInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  _handleRegenerateClick = (ev) => {
    ev.preventDefault();
    const { person } = this.props;
    this.setState({
      loading: true,
    });
    Meteor.call(
      "people.formId",
      { personId: person._id, regenerate: true },
      (err, res) => {
        this.setState({
          loading: false,
        });
        if (err) {
          alertStore.add(err);
        }
      }
    );
  };
  render() {
    const { intl, person, simple } = this.props;
    const { loading } = this.state;
    const url = getFormUrl(person ? person.formId : false);
    let filled = true;
    let tooltipId = "person-form-info";
    if (person) {
      filled = person.filledForm;
      tooltipId += person._id;
    }
    return (
      <Container
        className="form-info"
        simple={simple}
        filled={!!filled}
        loading={loading ? 1 : 0}
      >
        <label>
          <FontAwesomeIcon icon="align-left" />
          {person && !simple ? (
            <span>
              {filled
                ? intl.formatMessage(messages.filledFormLabel)
                : intl.formatMessage(messages.hasntFilledFormLabel)}
            </span>
          ) : null}
          <input type="text" disabled value={url} />
        </label>
        <span className="actions">
          <CopyToClipboard
            data-tip={intl.formatMessage(messages.copy)}
            data-for={tooltipId}
            text={url}
          >
            <FontAwesomeIcon icon="copy" />
          </CopyToClipboard>
          <a
            href={url}
            target="_blank"
            data-for={tooltipId}
            data-tip={intl.formatMessage(messages.view)}
          >
            <FontAwesomeIcon icon="link" />
          </a>
          {person ? (
            <a
              href="javascript:void(0);"
              data-tip={intl.formatMessage(messages.generate)}
              data-for={tooltipId}
              onClick={this._handleRegenerateClick}
            >
              <FontAwesomeIcon icon="sync" />
            </a>
          ) : null}
        </span>
        <ReactTooltip id={tooltipId} place="top" effect="solid" />
      </Container>
    );
  }
}

PersonFormInfo.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(PersonFormInfo);
