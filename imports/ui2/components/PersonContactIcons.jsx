import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import { getFormUrl } from "../utils/people";

import PopupLabel from "./PopupLabel.jsx";
import CopyToClipboard from "./CopyToClipboard.jsx";

const Container = styled.div`
  a {
    display: inline-block;
    margin: 0 0.3rem;
    opacity: 0.2;
    &.active {
      opacity: 1;
      &:hover,
      &:focus {
        color: #f60;
      }
    }
  }
`;

export default class PersonContactIcons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false
    };
  }
  getMeta(key) {
    const { person } = this.props;
    return person.campaignMeta && get(person.campaignMeta, key);
  }
  getLabelText(key) {
    const { person } = this.props;
    const data = get(person, `campaignMeta.${key}`);
    if (data) {
      return data;
    }
    return "Não disponível";
  }
  filledForm() {
    const { person } = this.props;
    return person.filledForm;
  }
  _handleClick = (ev, fade) => {
    this.setState({
      copied: true
    });
    fade();
  };
  _handleMouseLeave = () => {
    this.setState({
      copied: false
    });
  };
  render() {
    const { person } = this.props;
    const { copied } = this.state;
    const email = this.getMeta("contact.email");
    const phone = this.getMeta("contact.cellphone");
    const form = this.filledForm();
    if (person) {
      return (
        <Container>
          <PopupLabel
            text={this.getLabelText("contact.email")}
            disabled={!email}
            extra={email ? "Clique para copiar" : false}
            position="center"
            onClick={this._handleClick}
            onMouseLeave={this._handleMouseLeave}
          >
            <CopyToClipboard
              disabled={!email}
              text={email}
              className={email ? "active" : ""}
            >
              <FontAwesomeIcon icon="envelope" />
            </CopyToClipboard>
          </PopupLabel>
          <PopupLabel
            text={this.getLabelText("contact.cellphone")}
            disabled={!phone}
            extra={phone ? "Clique para copiar" : false}
            position="center"
            onClick={this._handleClick}
            onMouseLeave={this._handleMouseLeave}
          >
            <CopyToClipboard
              disabled={!phone}
              text={phone}
              className={phone ? "active" : ""}
            >
              <FontAwesomeIcon icon="phone" />
            </CopyToClipboard>
          </PopupLabel>
          <PopupLabel
            text={
              form ? "Preencheu o formulário" : "Não preencheu o formulário"
            }
            extra="Clique para copiar link"
            position="center"
            onClick={this._handleClick}
            onMouseLeave={this._handleMouseLeave}
          >
            <CopyToClipboard
              text={getFormUrl(person.formId)}
              className={form ? "active" : ""}
            >
              <FontAwesomeIcon icon="align-left" />
            </CopyToClipboard>
          </PopupLabel>
        </Container>
      );
    } else {
      return null;
    }
  }
}
