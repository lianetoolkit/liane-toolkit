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
  background: #f7f7f7;
  border-radius: 7px;
  border: 1px solid #ddd;
  margin: 0 0 2rem;
  .fa-align-left {
    font-size: 1.2em;
    margin: 0 0.5rem 0 1rem;
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
      padding: 0 1rem 0 0.5rem;
    }
    input {
      background: #f7f7f7;
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
  _handleRegenerateClick = () => {
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
    const { person } = this.props;
    const { loading } = this.state;
    const filled = person.filledForm;
    const tooltipId = `person-form-info-${person._id}`;
    const url = getFormUrl(person.formId);
    return (
      <Container filled={!!filled} loading={loading}>
        <label>
          <FontAwesomeIcon icon="align-left" />
          <span>
            {filled ? "Preencheu o formulário" : "Não preencheu o formulário"}
          </span>
          <input type="text" disabled value={url} />
        </label>
        <span className="actions">
          <CopyToClipboard
            data-tip="Copiar link"
            data-for={tooltipId}
            text={url}
          >
            <FontAwesomeIcon icon="copy" />
          </CopyToClipboard>
          <a
            href={url}
            target="_blank"
            data-for={tooltipId}
            data-tip="Acessar formulário"
          >
            <FontAwesomeIcon icon="link" />
          </a>
          <a
            href="javascript:void(0)"
            data-tip="Gerar nova URL"
            data-for={tooltipId}
            onClick={this._handleRegenerateClick}
          >
            <FontAwesomeIcon icon="sync" />
          </a>
        </span>
        <ReactTooltip id={tooltipId} place="top" effect="solid" />
      </Container>
    );
  }
}
