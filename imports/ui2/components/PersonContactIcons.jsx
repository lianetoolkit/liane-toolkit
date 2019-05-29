import React, { Component } from "react";
import ReactTooltip from "react-tooltip";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import { getFormUrl } from "../utils/people";

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
          {/* <PopupLabel
            text={this.getLabelText("contact.email")}
            disabled={!email}
            extra={email ? "Clique para copiar" : false}
            position="center"
            onClick={this._handleClick}
            onMouseLeave={this._handleMouseLeave}
          > */}
          <CopyToClipboard
            disabled={!email}
            text={email}
            className={email ? "active" : ""}
            data-tip={email ? `${email} (copiar)` : null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="envelope" />
          </CopyToClipboard>
          {/* </PopupLabel> */}
          <CopyToClipboard
            disabled={!phone}
            text={phone}
            className={phone ? "active" : ""}
            data-tip={phone ? `${phone} (copiar)` : null}
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="phone" />
          </CopyToClipboard>
          <CopyToClipboard
            text={getFormUrl(person.formId)}
            className={form ? "active" : ""}
            data-tip={
              form
                ? "Preencheu o formulário (copiar link)"
                : "Não preencheu o formulário (copiar link)"
            }
            data-for={`person-contact-icons-${person._id}`}
          >
            <FontAwesomeIcon icon="align-left" />
          </CopyToClipboard>
          <ReactTooltip
            id={`person-contact-icons-${person._id}`}
            place="top"
            effect="solid"
          />
        </Container>
      );
    } else {
      return null;
    }
  }
}
