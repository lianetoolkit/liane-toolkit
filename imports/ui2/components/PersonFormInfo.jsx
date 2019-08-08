import React, { Component } from "react";
import styled, { css } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { getFormUrl } from "/imports/ui2/utils/people";
import CopyToClipboard from "./CopyToClipboard.jsx";

import { alertStore } from "../containers/Alerts.jsx";

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
  ${props =>
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
  ${props =>
    props.filled &&
    css`
      background: #006633;
      color: #fff;
    `}
  ${props =>
    props.loading &&
    css`
      input {
        color: #aaa;
      }
    `}
`;

export default class PersonFormInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
  }
  _handleRegenerateClick = ev => {
    ev.preventDefault();
    const { person } = this.props;
    this.setState({
      loading: true
    });
    Meteor.call(
      "people.formId",
      { personId: person._id, regenerate: true },
      (err, res) => {
        this.setState({
          loading: false
        });
        if (err) {
          alertStore.add(err);
        }
      }
    );
  };
  render() {
    const { person, simple } = this.props;
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
        loading={loading}
      >
        <label>
          <FontAwesomeIcon icon="align-left" />
          {person && !simple ? (
            <span>{filled ? "Filled form" : "Hasn't filled form"}</span>
          ) : null}
          <input type="text" disabled value={url} />
        </label>
        <span className="actions">
          <CopyToClipboard data-tip="Copy link" data-for={tooltipId} text={url}>
            <FontAwesomeIcon icon="copy" />
          </CopyToClipboard>
          <a
            href={url}
            target="_blank"
            data-for={tooltipId}
            data-tip="View form"
          >
            <FontAwesomeIcon icon="link" />
          </a>
          {person ? (
            <a
              href="javascript:void(0);"
              data-tip="Generate new URL"
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
