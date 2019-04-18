import React, { Component } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { get } from "lodash";

import PopupLabel from "./PopupLabel.jsx";
import CopyToClipboard from "./CopyToClipboard.jsx";

const Container = styled.ul`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  li {
    margin: 0 0 0.75rem;
    padding: 0 0 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    &:last-child {
      margin: 0;
      padding: 0;
      border-bottom: 0;
    }
    svg {
      margin-right: 1rem;
    }
    span.empty {
      color: #999;
      font-style: italic;
    }
    a.copy {
      display: inline-block;
      color: #888 !important;
      margin: 0 0.5rem;
      &:hover,
      &:focus {
        color: #f60 !important;
      }
      svg {
        font-size: 0.8em;
        margin: 0;
      }
    }
  }
`;

export default class PersonSummary extends Component {
  value(key) {
    const { person } = this.props;
    return person.campaignMeta ? get(person.campaignMeta, key) : false;
  }
  text(key, defaultText) {
    const value = this.value(key);
    if (value) {
      return <span>{value}</span>;
    } else {
      return (
        <span className="empty">
          {defaultText || "Informação não disponível"}
        </span>
      );
    }
  }
  tags() {
    const { person, tags } = this.props;
    const personTags = get(person, "campaignMeta.basic_info.tags");
    if (personTags && personTags.length && tags && tags.length) {
      return tags
        .filter(tag => personTags.indexOf(tag._id) !== -1)
        .map(tag => tag.name)
        .join(", ");
    } else {
      return <span className="empty">Não existem tags associadas</span>;
    }
  }
  render() {
    const email = this.value("contact.email");
    const phone = this.value("contact.cellphone");
    return (
      <Container>
        <li>
          <FontAwesomeIcon icon="envelope" /> {this.text("contact.email")}
          {email ? (
            <CopyToClipboard text={email} className="copy">
              <PopupLabel text="Copiar" position="center">
                <FontAwesomeIcon icon="copy" />
              </PopupLabel>
            </CopyToClipboard>
          ) : null}
        </li>
        <li>
          <FontAwesomeIcon icon="phone" /> {this.text("contact.cellphone")}
          {phone ? (
            <CopyToClipboard text={phone} className="copy">
              <PopupLabel text="Copiar" position="center">
                <FontAwesomeIcon icon="copy" />
              </PopupLabel>
            </CopyToClipboard>
          ) : null}
        </li>
        <li>
          <FontAwesomeIcon icon="tag" /> {this.tags()}
        </li>
      </Container>
    );
  }
}
